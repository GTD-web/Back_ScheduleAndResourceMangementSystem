# 월간 근태 요약 VIEW (monthly_event_summary_view)

## 📋 개요

PostgreSQL VIEW를 활용한 월간 근태 요약 시스템입니다.
서버리스 환경에서 타임아웃 걱정 없이 빠르게 월간 근태 데이터를 조회할 수 있습니다.

## 🎯 왜 VIEW를 사용하나요?

### 문제점: 기존 방식
```typescript
// 실제 테이블에 직접 저장 방식
async generateMonthlySummary(employeeId, yyyymm) {
    // 1. 일일 요약 조회 (수백~수천 건)
    // 2. 근태 사용 내역 조회
    // 3. 통계 계산
    // 4. 주간 요약 생성
    // 5. 지각/결근/조퇴 상세 생성
    // 6. DB에 저장
    
    // ⚠️ 총 소요시간: 3~5초
    // ⚠️ 서버리스 타임아웃 위험!
}
```

**문제:**
- AWS Lambda 기본 타임아웃: 3초
- 처리 시간이 길어질수록 요청 끊길 위험 증가
- 여러 직원 동시 처리 시 더욱 느려짐

### 해결책: VIEW + 백그라운드 저장
```typescript
// VIEW에서 즉시 조회 + 백그라운드 저장
async getOrCreateMonthlySummary(employeeId, yyyymm) {
    // 1. VIEW에서 실시간 집계 데이터 조회 (⚡ 0.1~0.3초)
    const viewData = await viewRepository.find(...);
    
    // 2. 즉시 응답!
    response.send(viewData);
    
    // 3. 백그라운드에서 실제 테이블에 저장 (비동기, 에러 무시)
    this.saveToRealTableInBackground(employeeId, yyyymm);
}
```

**장점:**
- ✅ **즉시 응답**: VIEW 조회만 하므로 0.1~0.3초 내 응답
- ✅ **타임아웃 안전**: 서버리스 환경에서도 안전
- ✅ **점진적 최적화**: 백그라운드 저장으로 나중에는 더 빨라짐
- ✅ **에러 격리**: 저장 실패해도 응답에는 영향 없음

## 🏗️ 아키텍처

### 1. 데이터 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                    사용자 요청                               │
│   GET /api/monthly-summary/employee/:id/:yyyymm            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          MonthlySummaryController                            │
│  monthlyEventSummaryViewService.getOrCreateMonthlySummary() │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐          ┌──────────────────┐
│   VIEW 조회   │          │  백그라운드 저장  │
│  (즉시 응답)  │          │  (비동기, 에러무시)│
│              │          │                  │
│  0.1~0.3초   │          │   3~5초          │
└──────┬───────┘          └──────────────────┘
       │                           │
       │                           ▼
       │                  monthly_event_summaries
       │                  (실제 테이블에 저장)
       │
       ▼
    사용자에게 응답
```

### 2. DB 구조

#### VIEW (monthly_event_summary_view)
```sql
CREATE VIEW monthly_event_summary_view AS
SELECT 
    des.employeeId,
    e.employeeNumber,
    e.name AS employeeName,
    TO_CHAR(DATE_TRUNC('month', des.date::date), 'YYYY-MM') AS yyyymm,
    
    -- 근무일수
    COUNT(CASE WHEN NOT des.isHoliday AND des.workTime IS NOT NULL THEN 1 END)::int AS workDaysCount,
    
    -- 총 근무시간
    COALESCE(SUM(CASE WHEN NOT des.isHoliday THEN des.workTime ELSE 0 END), 0)::int AS totalWorkTime,
    
    -- 총 근무 가능 시간 (8시간 * 근무일수)
    COALESCE(COUNT(CASE WHEN NOT des.isHoliday THEN 1 END) * 480, 0)::int AS totalWorkableTime,
    
    -- 평균 근무시간
    COALESCE(ROUND(AVG(CASE WHEN NOT des.isHoliday THEN des.workTime END)::numeric, 2), 0) AS avgWorkTimes,
    
    -- 근태 유형별 카운트 (JSONB)
    jsonb_build_object(
        '연차', COALESCE(SUM(CASE WHEN at.title = '연차' THEN 1 ELSE 0 END), 0),
        '오전반차', COALESCE(SUM(CASE WHEN at.title = '오전반차' THEN 1 ELSE 0 END), 0),
        -- ... 기타 근태 유형들
        '지각', COALESCE(SUM(CASE WHEN des.isLate THEN 1 ELSE 0 END), 0),
        '결근', COALESCE(SUM(CASE WHEN des.isAbsent THEN 1 ELSE 0 END), 0),
        '조퇴', COALESCE(SUM(CASE WHEN des.isEarlyLeave THEN 1 ELSE 0 END), 0)
    ) AS attendanceTypeCount
    
FROM daily_event_summaries des
LEFT JOIN employees e ON des.employeeId = e.id
LEFT JOIN used_attendance ua ON des.employeeId = ua.employeeId 
    AND des.date BETWEEN ua.startDate AND ua.endDate
LEFT JOIN attendance_types at ON ua.attendanceTypeId = at.attendanceTypeId
GROUP BY des.employeeId, e.employeeNumber, e.name, DATE_TRUNC('month', des.date::date);
```

#### 실제 테이블 (monthly_event_summaries)
```typescript
@Entity('monthly_event_summaries')
export class MonthlyEventSummary {
    @PrimaryGeneratedColumn('uuid')
    monthlyEventSummaryId: string;

    @Column({ type: 'varchar', length: 10 })
    employeeNumber: string;

    @Column({ type: 'uuid' })
    employeeId: string;

    @Column({ type: 'varchar', length: 7 })
    yyyymm: string; // 'YYYY-MM'

    @Column({ type: 'int', default: 0 })
    workDaysCount: number;

    @Column({ type: 'int', default: 0 })
    totalWorkTime: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    avgWorkTimes: number;

    @Column({ type: 'jsonb', default: {} })
    attendanceTypeCount: { [key: string]: number };

    @Column({ type: 'jsonb', default: [] })
    weeklyWorkTimeSummary: Array<{ ... }>;

    @Column({ type: 'jsonb', default: [] })
    lateDetails: Array<{ ... }>;

    @Column({ type: 'jsonb', default: [] })
    absenceDetails: Array<{ ... }>;

    @Column({ type: 'jsonb', default: [] })
    earlyLeaveDetails: Array<{ ... }>;

    @Column({ type: 'timestamp' })
    createdAt: Date;

    @Column({ type: 'timestamp' })
    updatedAt: Date;
}
```

## 📡 API 사용 예시

### 1. 월간 요약 상세 조회 (VIEW 사용)
```bash
curl -X GET \
  'http://localhost:3020/api/monthly-summary/employee/839e6f06-8d44-43a1-948c-095253c4cf8c/2025-10'
```

**응답:**
```json
{
  "success": true,
  "data": {
    "employeeId": "839e6f06-8d44-43a1-948c-095253c4cf8c",
    "employeeNumber": "24016",
    "employeeName": "김규현",
    "yyyymm": "2025-10",
    "workDaysCount": 17,
    "totalWorkTime": 8837,
    "totalWorkableTime": 13728,
    "avgWorkTimes": 519.82,
    "attendanceTypeCount": {
      "연차": 0,
      "오전반차": 2,
      "오후반차": 1,
      "지각": 0,
      "결근": 0,
      "조퇴": 0
    },
    "dailyEventSummary": [ ... ],
    "weeklyWorkTimeSummary": [ ... ],
    "lateDetails": [],
    "absenceDetails": [],
    "earlyLeaveDetails": []
  }
}
```

**특징:**
- ⚡ **0.1~0.3초** 내 즉시 응답
- 📊 VIEW에서 실시간 집계
- 🔄 백그라운드에서 `monthly_event_summaries` 테이블에 저장 시작

### 2. 특정 연월의 모든 직원 조회
```bash
curl -X GET \
  'http://localhost:3020/api/monthly-summary/year-month/2025-10'
```

### 3. 수동 월간 요약 생성 (필요시)
```bash
curl -X POST \
  'http://localhost:3020/api/monthly-summary/generate/839e6f06-8d44-43a1-948c-095253c4cf8c/2025-10'
```

## 🔍 성능 비교

### 시나리오: 직원 1명의 10월 월간 요약 조회

| 방식 | 소요시간 | 서버리스 안전성 | 설명 |
|------|---------|----------------|------|
| **직접 생성** | 3~5초 | ⚠️ 위험 | 조회 + 계산 + 저장을 동시에 수행 |
| **VIEW 조회** | 0.1~0.3초 | ✅ 안전 | VIEW만 조회 후 즉시 응답 |
| **실제 테이블 조회** | 0.05~0.1초 | ✅ 안전 | 이미 저장된 데이터 조회 (두 번째 요청부터) |

### 시나리오: 전체 직원(150명) 10월 월간 요약 조회

| 방식 | 소요시간 | 서버리스 안전성 |
|------|---------|----------------|
| **직접 생성** | 60~90초 | ❌ 타임아웃 | Lambda 타임아웃 발생 가능 |
| **VIEW 조회** | 1~3초 | ✅ 안전 | VIEW 한 번에 조회 |

## 🔄 데이터 신선도

### 첫 요청 (VIEW)
- **데이터 신선도**: 실시간 (가장 최신)
- **성능**: 0.1~0.3초
- **백그라운드**: 실제 테이블에 저장 시작

### 두 번째 요청 이후
- **데이터 신선도**: 실제 테이블 (캐시됨)
- **성능**: 0.05~0.1초 (더 빠름)
- **갱신**: 필요 시 수동 또는 스케줄러로 재생성

## 🛠️ 유지보수

### VIEW 재생성
```sql
DROP VIEW IF EXISTS monthly_event_summary_view;
CREATE VIEW monthly_event_summary_view AS ...;
```

### 실제 테이블 수동 재생성
```bash
# 특정 직원의 특정 월만 재생성
curl -X POST \
  'http://localhost:3020/api/monthly-summary/generate/:employeeId/:yyyymm'

# 배치로 전체 재생성 (스크립트 필요)
for employee in $employees; do
    curl -X POST \
      "http://localhost:3020/api/monthly-summary/generate/$employee/2025-10"
done
```

### 스케줄러 활용 (권장)
```typescript
// 매일 새벽 2시에 전체 직원 월간 요약 재생성
@Cron('0 2 * * *')
async regenerateMonthlySummaries() {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const employees = await this.employeeService.findAll();
    
    for (const employee of employees) {
        await this.monthlySummaryService.generateOrUpdateMonthlySummary(
            employee.id,
            currentMonth,
        );
    }
}
```

## ⚠️ 주의사항

### 1. VIEW vs 실제 테이블 선택
- **VIEW**: 항상 최신 데이터, 약간 느림 (0.1~0.3초)
- **실제 테이블**: 캐시된 데이터, 매우 빠름 (0.05~0.1초)

### 2. 백그라운드 저장 실패
백그라운드 저장이 실패해도 응답에는 영향을 주지 않습니다.
로그에서 `백그라운드 저장 실패` 메시지 확인 후 수동 재생성 가능.

### 3. JSONB 컬럼 쿼리
```sql
-- 특정 근태 유형 개수 조회
SELECT 
    employeeNumber,
    yyyymm,
    attendanceTypeCount->>'연차' AS 연차_개수
FROM monthly_event_summary_view
WHERE (attendanceTypeCount->>'연차')::int > 5;
```

## 📚 참고 자료

- [PostgreSQL VIEW 문서](https://www.postgresql.org/docs/current/sql-createview.html)
- [TypeORM ViewEntity](https://typeorm.io/view-entities)
- [AWS Lambda 타임아웃 설정](https://docs.aws.amazon.com/lambda/latest/dg/configuration-function-common.html)

