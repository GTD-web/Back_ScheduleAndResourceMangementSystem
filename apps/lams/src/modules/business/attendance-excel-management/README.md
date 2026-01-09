# Attendance Excel Management

근태 관련 엑셀 파일을 관리하는 Business 모듈입니다.

## API 엔드포인트

### 근태/출입 엑셀 일괄 업로드

```
POST /api/attendance-excel/upload
Content-Type: multipart/form-data
```

**Request Body:**
```
- files: 엑셀 파일 배열 (최대 10개)
- uploadBy: 업로더 ID (UUID)
```

**파일명 규칙:**
- 출입 이벤트 파일: 파일명에 **"출입"** 포함
  - 예: `11월_출입이력.xlsx`, `출입내역_2025.xlsx`
- 근태 사용 파일: 파일명에 **"근태"** 포함
  - 예: `11월_근태사용내역.xlsx`, `근태_2025.xlsx`

**Response:**
```json
{
  "success": true,
  "totalFiles": 3,
  "processedFiles": 3,
  "results": [
    {
      "fileName": "11월_출입이력.xlsx",
      "type": "event",
      "success": true,
      "fileId": "uuid",
      "statistics": {
        "totalEmployees": 50,
        "totalEvents": 1500,
        "totalSummaries": 1000,
        "year": "2025",
        "month": "11"
      }
    },
    {
      "fileName": "11월_근태사용내역.xlsx",
      "type": "attendance",
      "success": true,
      "fileId": "uuid",
      "statistics": {
        "totalEmployees": 50,
        "totalUsedAttendance": 150
      }
    }
  ]
}
```

## 엑셀 파일 형식

### 1. 출입 이벤트 파일

파일명에 **"출입"** 포함 필수

| 위치 | 발생시각 | 장치명 | 상태 | 이름 | 사원번호 | 조직 |
|------|----------|--------|------|------|----------|------|
| 본사 | 2025-11-19 08:30:00 | 출입문1 | 입실 | 홍길동 | EMP001 | 개발팀 |

### 2. 근태 사용 내역 파일

파일명에 **"근태"** 포함 필수

| ERP사번 | 이름 | 부서 | 기간 | 신청일수 | 근태구분 |
|---------|------|------|------|----------|----------|
| EMP001 | 홍길동 | 개발팀 | 2025-11-19 ~ 2025-11-21 | 3 | 연차 |

## 사용 예시

### cURL로 여러 파일 업로드

```bash
curl -X 'POST' \
  'http://localhost:3000/api/attendance-excel/upload' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'files=@11월_출입이력.xlsx' \
  -F 'files=@11월_근태사용내역.xlsx' \
  -F 'files=@12월_출입이력.xlsx' \
  -F 'uploadBy=839e6f06-8d44-43a1-948c-095253c4cf8c'
```

### JavaScript (fetch)

```javascript
const formData = new FormData();
formData.append('files', file1); // 11월_출입이력.xlsx
formData.append('files', file2); // 11월_근태사용내역.xlsx
formData.append('uploadBy', 'user-uuid');

const response = await fetch('/api/attendance-excel/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result);
```

## 처리 프로세스

### 전체 흐름

```
1. 파일 업로드 (최대 10개)
   ↓
2. 파일명 유효성 검증
   - "출입" 또는 "근태" 포함 확인
   ↓
3. 파일명 정렬 (가나다순/알파벳순)
   ↓
4. 순차적 처리
   ├─ 출입 파일 → uploadAndProcessEventHistory()
   └─ 근태 파일 → uploadAndProcessAttendanceData()
   ↓
5. 결과 반환
```

### 출입 이벤트 처리 (파일명에 "출입" 포함)

```
1. S3 업로드
2. 엑셀 데이터 읽기
3. 데이터 가공 (한글→영문 변환, 시간 분리)
4. 직원 정보 검증
5. 출입 이벤트 저장 (event_info)
6. 일일 요약 생성 및 저장 (daily_event_summaries)
   - 직원별, 날짜별 그룹화
   - 최초 출근/최종 퇴근 시각 계산
   - 공휴일/주말 체크
```

### 근태 데이터 처리 (파일명에 "근태" 포함)

```
1. S3 업로드
2. 엑셀 데이터 읽기
3. 데이터 가공 (한글→영문 변환)
4. 직원 정보 검증
5. 근태 유형 검증
6. 공휴일 정보 조회
7. 기간 파싱 및 날짜 범위 생성
8. 공휴일/주말 제외
9. 근태 사용 내역 저장 (used_attendance)
```

## 처리 순서

파일은 **파일명 순서**대로 처리됩니다:

```
예시:
1. 01_출입이력.xlsx
2. 02_근태사용내역.xlsx
3. 11월_출입.xlsx
4. 11월_근태.xlsx

→ 가나다/알파벳 순으로 자동 정렬되어 처리
```

## 에러 처리

### 400 Bad Request

**파일이 없음**
```json
{
  "statusCode": 400,
  "message": "파일이 업로드되지 않았습니다."
}
```

**업로더 ID 누락**
```json
{
  "statusCode": 400,
  "message": "업로더 ID가 필요합니다."
}
```

**파일명 규칙 위반**
```json
{
  "statusCode": 400,
  "message": "파일명에 \"출입\" 또는 \"근태\"가 포함되어야 합니다. 잘못된 파일: data.xlsx, report.xlsx"
}
```

### 개별 파일 처리 실패

개별 파일 처리가 실패해도 **다른 파일은 계속 처리**됩니다:

```json
{
  "success": true,
  "totalFiles": 3,
  "processedFiles": 2,
  "results": [
    {
      "fileName": "11월_출입이력.xlsx",
      "type": "event",
      "success": true,
      "fileId": "uuid",
      "statistics": {...}
    },
    {
      "fileName": "11월_근태사용내역.xlsx",
      "type": "attendance",
      "success": false,
      "error": "엑셀 데이터를 읽는 중 오류가 발생했습니다."
    },
    {
      "fileName": "12월_출입이력.xlsx",
      "type": "event",
      "success": true,
      "fileId": "uuid",
      "statistics": {...}
    }
  ]
}
```

## 주의사항

### 파일명 규칙

- **반드시** 파일명에 "출입" 또는 "근태" 포함
- 대소문자 구분 없음
- 한글/영문 모두 지원

### 한글 파일명

한글 파일명은 자동으로 처리됩니다 (latin1 → utf8 변환).

### 트랜잭션

각 파일의 처리는 독립적인 트랜잭션으로 관리됩니다:
- 파일 A 성공, 파일 B 실패 → A는 저장됨
- 한 파일 내에서 일부 실패 시 → 전체 롤백

### 중복 데이터

동일한 파일을 여러 번 업로드하면 중복 데이터가 생성될 수 있습니다.

### 처리 순서

파일명 순서대로 처리되므로, 의도적인 순서가 필요하면 파일명에 번호를 붙이세요:
- `01_출입이력.xlsx`
- `02_근태사용내역.xlsx`

## 성능

### 처리 시간 (예상)

**단일 파일:**
- 1,000건: ~2초
- 10,000건: ~10초
- 100,000건: ~60초

**여러 파일 (순차 처리):**
- 3개 파일 × 10,000건: ~30초
- 10개 파일 × 10,000건: ~100초

### 최적화

- 각 파일은 순차적으로 처리됩니다
- 트랜잭션 단위로 일괄 저장
- 메모리 효율적인 스트림 처리

## Swagger 문서

API 문서는 다음 경로에서 확인할 수 있습니다:

```
http://localhost:3000/api-docs
```

## 의존 모듈

- `@context/attendance-data`: 데이터 가공 로직
- `@context/file-management`: 파일 업로드 및 읽기
- `@domain/employee`: 직원 정보
- `@domain/attendance-type`: 근태 유형
- `@domain/holiday-info`: 공휴일 정보
- `@domain/event-info`: 출입 이벤트
- `@domain/used-attendance`: 근태 사용 내역
- `@domain/daily-event-summary`: 일일 요약

## 예제 시나리오

### 시나리오 1: 월별 데이터 일괄 업로드

```
파일 목록:
- 2025_11월_출입이력.xlsx
- 2025_11월_근태사용내역.xlsx

→ 출입 데이터 먼저 처리 후 근태 데이터 처리
→ 11월 전체 데이터 완성
```

### 시나리오 2: 여러 달 데이터 한 번에 업로드

```
파일 목록:
- 10월_출입.xlsx
- 10월_근태.xlsx
- 11월_출입.xlsx
- 11월_근태.xlsx
- 12월_출입.xlsx
- 12월_근태.xlsx

→ 파일명 순으로 정렬되어 순차 처리
→ 3개월치 데이터 자동 처리
```

### 시나리오 3: 일부 파일 실패

```
파일 목록:
- 11월_출입이력.xlsx ✅ 성공
- 11월_근태사용내역.xlsx ❌ 실패 (형식 오류)
- 12월_출입이력.xlsx ✅ 성공

→ 실패한 파일만 다시 업로드하면 됨
```
