# Attendance Data Context

출입/근태 데이터 가공을 담당하는 Context 모듈입니다.

## 개요

엑셀 파일에서 읽은 출입 이벤트 및 근태 사용 내역 데이터를 가공하여 데이터베이스에 저장하는 비즈니스 로직을 제공합니다.

## 주요 기능

### 1. 출입 이벤트 처리 (`uploadAndProcessEventHistory`)

출입 이벤트 엑셀 파일을 업로드하고 다음 작업을 수행합니다:

- 파일 업로드 및 S3 저장
- 엑셀 데이터 읽기 및 가공
- 출입 이벤트 데이터 저장 (`event_info`)
- 일일 출입 요약 생성 (`daily_event_summaries`)

**처리 흐름:**
```
엑셀 업로드 → 데이터 가공 → 직원 검증 → 이벤트 저장 → 일일 요약 생성
```

### 2. 근태 사용 내역 처리 (`uploadAndProcessAttendanceData`)

근태 사용 내역 엑셀 파일을 업로드하고 다음 작업을 수행합니다:

- 파일 업로드 및 S3 저장
- 엑셀 데이터 읽기 및 가공
- 근태 사용 내역 데이터 저장 (`used_attendance`)
- 공휴일 및 주말 자동 제외

**처리 흐름:**
```
엑셀 업로드 → 데이터 가공 → 직원/근태유형 검증 → 날짜 범위 계산 → 근태 내역 저장
```

## 의존성

### Context 모듈
- `FileManagementContext`: 파일 업로드 및 엑셀 읽기

### Domain 서비스
- `DomainEmployeeService`: 직원 정보 조회
- `DomainAttendanceTypeService`: 근태 유형 조회
- `DomainHolidayInfoService`: 공휴일 정보 조회
- `DomainUsedAttendanceService`: 근태 사용 내역 저장
- `DomainEventInfoService`: 출입 이벤트 저장
- `DomainDailyEventSummaryService`: 일일 요약 저장

## 데이터 가공 로직

### 출입 이벤트 데이터 가공

1. **한글 키 변환**: 엑셀의 한글 컬럼명을 영문으로 변환
2. **년월 추출**: 첫 번째 이벤트의 시각에서 년월 추출
3. **직원별 그룹화**: 사원번호 기준으로 이벤트 그룹화
4. **시간 분리**: `eventTime`을 `yyyymmdd`와 `hhmmss`로 분리

### 근태 데이터 가공

1. **한글 키 변환**: 엑셀의 한글 컬럼명을 영문으로 변환
2. **직원별 그룹화**: 사원번호 기준으로 근태 기록 그룹화
3. **날짜 범위 계산**: 기간 문자열을 파싱하여 날짜 배열 생성
4. **공휴일/주말 제외**: 실제 근무일만 근태 사용 내역으로 저장

### 일일 요약 생성

1. **직원별, 날짜별 그룹화**: 이벤트를 직원과 날짜로 그룹화
2. **최초/최종 시각 계산**: 각 날짜의 가장 빠른/늦은 출입 시각 추출
3. **공휴일 체크**: 공휴일 및 주말 여부 확인
4. **근무 시간 계산**: 출근-퇴근 시간차를 분 단위로 계산

## 트랜잭션 처리

모든 데이터 처리는 트랜잭션으로 관리됩니다:

- 성공 시: 모든 변경사항 커밋
- 실패 시: 모든 변경사항 롤백

## 에러 처리

- 존재하지 않는 직원: 경고 로그 출력 후 스킵
- 존재하지 않는 근태 유형: 경고 로그 출력 후 스킵
- 잘못된 엑셀 형식: `BadRequestException` 발생
- 기타 오류: 트랜잭션 롤백 후 에러 전파

## 사용 예시

### Context에서 직접 사용

```typescript
import { AttendanceDataContext } from '@context/attendance-data';

@Injectable()
class SomeService {
    constructor(
        private readonly attendanceDataContext: AttendanceDataContext,
    ) {}

    async processEventFile(file: Express.Multer.File, userId: string) {
        return await this.attendanceDataContext.uploadAndProcessEventHistory(file, userId);
    }
}
```

### Business 레이어에서 사용

```typescript
import { AttendanceExcelManagementModule } from '@business/attendance-excel-management';

// API를 통해 자동으로 처리
// POST /api/attendance-excel/upload-event-history
```

## 성능 최적화

### 서버리스 환경 고려사항

1. **일괄 처리**: 엔티티를 배열로 모아서 한 번에 저장
2. **트랜잭션 사용**: 데이터 일관성 보장 및 오류 시 자동 롤백
3. **메모리 효율**: 스트리밍 방식으로 대용량 파일 처리 가능

### 대용량 데이터 처리

- 최대 10,000행까지 한 번에 처리 (기본 설정)
- 필요시 배치 처리로 분할 가능

## 로깅

모든 주요 단계에서 로그를 출력합니다:

- 파일 업로드 시작/완료
- 엑셀 데이터 읽기 완료
- 데이터 가공 완료
- 각 단계별 처리 건수
- 에러 발생 시 상세 정보

## 테스트

```bash
# 단위 테스트
npm test attendance-data.context

# E2E 테스트
npm run test:e2e attendance-excel-management
```

