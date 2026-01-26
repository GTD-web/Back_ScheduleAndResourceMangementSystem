# PRV DB 마이그레이션 전략

이 문서는 `prv-db-mgr` 모듈을 활용해 **이전 버전 DB(라이브)** 데이터를
`apps/lams/src/refactoring/domain` 엔티티 및 `libs/modules` 조직 엔티티 구조에 맞춰
마이그레이션하는 전략을 정리한다.

---

## 목표

- 이전 버전 DB 데이터를 **정합성 있는 형태로 리팩토링 DB**에 이관한다.
- 조직 정보(부서/직원/직책/직급/소속이력)는 `libs/modules` 공통 엔티티 기준으로 통합한다.
- 근태 도메인(출입, 사용, 요약 등)은 `refactoring/domain` 엔티티 구조에 맞춰 매핑한다.

---

## 범위

- **입력**: `apps/lams/src/refactoring/integrations/prv-db-mgr/entities` (이전 버전 스키마)
- **출력**:
  - `apps/lams/src/refactoring/domain/**` 엔티티
  - `libs/modules/**` 조직 관련 엔티티

---

## 기본 원칙

1. **읽기/쓰기 DB 분리**
   - 읽기: 이전 버전 DB (prv)
   - 쓰기: 리팩토링 DB (기존 서비스 DB)

2. **정규화/중복 제거**
   - 조직 정보는 `libs/modules` 기준으로 **중앙 집중화**한다.
   - 이전 DB의 중복/변형 필드는 변환 로직에서 정규화한다.

3. **단방향 이관**
   - 마이그레이션은 “이전 -> 리팩토링” 단방향이다.
   - 되돌리기는 별도 스냅샷/백업으로 수행한다.

4. **검증 포함**
   - 마이그레이션 전/후 **row count, 샘플 비교, FK 무결성** 검증 단계를 둔다.

---

## 데이터 흐름

1. **PRV DB 연결 확인**
   - `prv-db-mgr` 모듈에서 DataSource 연결 검증

2. **PRV 데이터 로딩**
   - 테이블별 조회 후 메모리 내 매핑
   - 대용량 테이블은 배치 로딩

3. **정규화/매핑**
   - 조직 정보 -> `libs/modules`
   - 근태 정보 -> `refactoring/domain`

4. **저장 순서**
   1) 조직 마스터(부서, 직급, 직책)
   2) 직원
   3) 부서-직원-직책 관계 및 이력
   4) 근태 타입/휴일/정책
   5) 출입 이벤트/사용/요약
   6) 스냅샷/승인/알림/부가 테이블

5. **검증**
   - 카운트 비교
   - 샘플 비교
   - FK 무결성 확인

---

## 조직 정보 마이그레이션 (공통 엔티티)

### 대상 엔티티
- `libs/modules/department`
- `libs/modules/employee`
- `libs/modules/position`
- `libs/modules/rank`
- `libs/modules/employee-department-position`
- `libs/modules/employee-department-position-history`

### 전략
- 이전 DB의 조직/직원/직책/직급 테이블을 일괄 읽기
- `employee_number` 또는 `employee_id` 기준으로 매핑
- 부서 트리 구조는 상위 부서 관계 유지
- 이력 테이블은 **현재 소속 + 과거 이력** 모두 반영

---

## 근태 도메인 마이그레이션 (refactoring/domain)

### 대상 엔티티 예시
- `attendance-type`
- `holiday-info`
- `event-info`
- `used-attendance`
- `daily-event-summary`
- `monthly-event-summary`
- `data-snapshot-*`

### 전략
- 출입 이벤트 -> EventInfo
- 근태 사용 -> UsedAttendance
- 일/월 요약은 **원본 재계산 여부** 결정
  - 초기 이관은 원본을 직접 매핑
  - 이후 정합성 확보를 위해 재생성(리빌드) 단계 추가

---

## 매핑 규칙 (예시)

- **직원 매핑**
  - `employee_number` 우선
  - 동일 번호 중복 시: 최신 레코드 우선

- **부서 매핑**
  - 코드/명칭 정규화
  - 상위 부서 없는 경우 루트로 설정

- **근태 타입**
  - 코드/이름 기준 매핑
  - 누락된 타입은 사전 등록 또는 기본값 처리

---

## 마이그레이션 실행 구조 (제안)

1. `prv-db-mgr`에 **PRV 전용 DataSource**
2. `migration` 모듈에 **리팩토링 DB 저장 서비스**
3. 전용 서비스에서 **읽기 -> 변환 -> 저장** 파이프라인 구성
4. **테이블별 배치 처리** 및 로그 출력

---

## 검증 체크리스트

- [ ] 조직 엔티티 카운트 일치
- [ ] 직원-부서-직책 FK 연결 정상
- [ ] 근태 타입 매핑 누락 없음
- [ ] 이벤트/사용 내역 카운트 비교
- [ ] 일/월 요약 재생성 가능 여부 확인

---

## 후속 작업 제안

- 실제 매핑 스키마 문서화 (필드 단위 매핑표)
- 대용량 테이블 배치 크기 정책 정의
- 실패/재시도 전략 정의

---

## 기준 데이터 맵핑 규칙 (사전 생성 데이터 사용)

초기화 시 생성된 조직/근태/휴일 데이터를 기준으로 **FK를 재맵핑**한다.

- 직원: `employeeNumber` 기준 매핑
- 부서: `departmentCode` 기준 매핑
- 근태유형: `title` 기준 매핑
- 휴일: `holidayName + holidayDate` 기준 매핑

사용되는 PRV 기준 엔티티:
- `attendance-type.entity.ts`
- `employee-info.entity.ts`
- `department-info.entity.ts`
- `holiday-info.entity.ts`

---

## 대상 엔티티별 맵핑 전략

### 1) DataSnapshotInfoEntity

- **PRV 필드 → 리팩토링 도메인**
  - `snapshotName` → `snapshot_name`
  - `description` → `description`
  - `snapshotType` → `snapshot_type`
  - `yyyy` → `yyyy`
  - `mm` → `mm`
  - `department.departmentCode` 기준으로 `department_id` 재매핑
- **FK 재매핑 규칙**
  - `departmentId`는 PRV 기준이므로 **부서코드로 재매핑**
- **주의**
  - 초기화 데이터에 없는 부서코드는 null로 유지하고 다음 데이터로 진행

### 2) DataSnapshotChildInfoEntity

- **PRV 필드 → 리팩토링 도메인**
  - `employeeNumber` 기준으로 `employee_id` 재매핑
  - `employeeName` → `employee_name`
  - `employeeNumber` → `employee_number`
  - `yyyy` → `yyyy`
  - `mm` → `mm`
  - `snapshotData` → `snapshot_data` (JSON stringify 유지)
- **FK 재매핑 규칙**
  - `employeeId`는 PRV 기준이므로 **사번으로 재매핑**
- **주의**
  - `parentSnapshot` 관계는 `DataSnapshotInfoEntity` 매핑 결과의 PK로 연결

### 3) DailyEventSummaryEntity

- **PRV 필드 → 리팩토링 도메인**
  - `date` → `date`
  - `employee.employeeNumber` 기준으로 `employee_id` 재매핑
  - `isHoliday` → `is_holiday`
  - `enter/leave/realEnter/realLeave` → 동일
  - `isChecked/isLate/isEarlyLeave/isAbsent` → 동일
  - `workTime` → `work_time`
  - `note` → `note`
- **FK 재매핑 규칙**
  - `employee`는 **사번 기준** 재매핑
  - `monthly_event_summary_id`는 `MonthlyEventSummary` 매핑 결과로 연결
- **주의**
  - `used_attendances`는 `UsedAttendance` 기준으로 재구성 권장

### 4) EventInfoEntity

- **PRV 필드 → 리팩토링 도메인**
  - `employeeName` → `employee_name`
  - `employeeNumber` → `employee_number` (사번으로 존재 여부 확인)
  - `eventTime` → `event_time`
  - `yyyymmdd` → `yyyymmdd`
  - `hhmmss` → `hhmmss`
- **주의**
  - 중복 이벤트(`employee_number + event_time`) 유니크 제약 확인 필요

### 5) UsedAttendanceEntity

- **PRV 필드 → 리팩토링 도메인**
  - `usedAt` → `used_at`
  - `employee.employeeNumber` 기준으로 `employee_id` 재매핑
  - `attendanceType.title` 기준으로 `attendance_type_id` 재매핑
- **FK 재매핑 규칙**
  - `employee_id`: **사번**
  - `attendance_type_id`: **근태유형 title**
- **주의**
  - 유니크(`employee_id + used_at + attendance_type_id`) 충돌 방지

### 6) MonthlyEventSummaryEntity

- **PRV 필드 → 리팩토링 도메인**
  - `employeeNumber` → `employee_number`
  - `employeeName` → `employee_name`
  - `employeeId` → `employee_id` (사번으로 재매핑)
  - `yyyymm` → `yyyymm`
  - `note` → `note`
  - `additionalNote` → `additional_note`
  - `workDaysCount/totalWorkableTime/totalWorkTime/avgWorkTimes` → 동일
  - `attendanceTypeCount/weeklyWorkTimeSummary/lateDetails/absenceDetails/earlyLeaveDetails` → 동일
- **FK 재매핑 규칙**
  - `employee_id`는 **사번 기준 재매핑**
- **주의**
  - `dailyEventSummary` 컬럼은 **일간요약 FK 연결 방식으로 대체**됨
  - 월간요약 저장 후, 일간요약의 `monthly_event_summary_id`를 **월간요약 ID로 연결**
  - PRV의 `dailyEventSummary` 배열은 **일간요약 생성 데이터로 사용**하며,
    각 아이템의 `usedAttendances`는 일간요약의 `used_attendances` 컬럼에 매핑
  - `used_attendances`에는 근태유형 타이틀 기준으로 재매핑된
    `attendanceTypeId/title/workTime/isRecognizedWorkTime/startWorkTime/endWorkTime/deductedAnnualLeave`를 저장

---

## 재매핑 순서 제안

1. 기준 데이터(직원/부서/근태유형/휴일) 로딩 및 키맵 생성
2. EventInfo → DailyEventSummary → MonthlyEventSummary 순서로 적재
3. UsedAttendance는 근태유형/직원 매핑 이후 적재
4. DataSnapshotInfo → DataSnapshotChild 순서로 적재


