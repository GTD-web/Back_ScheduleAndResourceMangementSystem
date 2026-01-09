# Libs Modules - 공통 도메인 모듈

이 폴더는 LAMS와 LSMS에서 공통으로 사용하는 도메인 모듈을 포함합니다.

## 구조

```
libs/modules/
├── department/              # 부서 (공통)
├── employee/                # 직원 (공통)
├── employee-department-position/  # 직원-부서-직책 관계 (공통)
├── employee-department-position-history/  # 직원-부서-직책 이력 (공통)
├── position/                # 직책 (공통)
└── rank/                    # 직급 (공통)
```

## 사용 원칙

### ✅ 공통 모듈에서 해야 할 것

1. **공통 엔티티만 참조**: 다른 공통 모듈의 엔티티만 참조

    ```typescript
    // ✅ 좋은 예
    import { Rank } from '../rank/rank.entity';
    import { Department } from '../department/department.entity';
    ```

2. **프로젝트 독립적**: LAMS나 LSMS에 특화된 로직 제외

3. **메타데이터 중심**: 두 프로젝트에서 공유하는 메타데이터 관련 엔티티만 포함

### ❌ 공통 모듈에서 하지 말아야 할 것

1. **프로젝트별 엔티티 참조 금지**

    ```typescript
    // ❌ 나쁜 예 - LAMS 전용 엔티티 참조
    import { DailyEventSummary } from '../daily-event-summary/daily-event-summary.entity';

    // ❌ 나쁜 예 - LSMS 전용 엔티티 참조
    import { Reservation } from '../reservation/reservation.entity';
    ```

2. **상대 경로로 프로젝트별 엔티티 참조 금지**
    ```typescript
    // ❌ 절대 하지 말 것
    import { DailyEventSummary } from '../../apps/lams/src/modules/domain/daily-event-summary/daily-event-summary.entity';
    ```

## 프로젝트별 확장 방법

### LAMS 프로젝트

프로젝트별 엔티티 관계가 필요한 경우, 각 프로젝트의 도메인 모듈에서 확장:

```typescript
// apps/lams/src/modules/domain/employee/employee.entity.ts
import { Employee as BaseEmployee } from '@libs/modules/employee/employee.entity';
import { DailyEventSummary } from '../daily-event-summary/daily-event-summary.entity';

@Entity('employees')
export class Employee extends BaseEmployee {
    // LAMS 전용 관계 추가
    @OneToMany(() => DailyEventSummary, (dailyEventSummary) => dailyEventSummary.employee)
    dailyEventSummary?: DailyEventSummary[];
}
```

또는 별도 엔티티로 관리:

```typescript
// apps/lams/src/modules/domain/employee/employee.entity.ts
import { Employee as LibEmployee } from '@libs/modules/employee/employee.entity';
import { DailyEventSummary } from '../daily-event-summary/daily-event-summary.entity';

@Entity('employees')
export class Employee extends LibEmployee {
    // LAMS 전용 필드나 관계 추가 가능
}
```

### LSMS 프로젝트

```typescript
// apps/lsms/src/domain/employee/employee.entity.ts
import { Employee as BaseEmployee } from '@libs/modules/employee/employee.entity';
import { Reservation } from '../reservation/reservation.entity';

@Entity('employees')
export class Employee extends BaseEmployee {
    // LSMS 전용 관계 추가
    @OneToMany(() => Reservation, (reservation) => reservation.employee)
    reservations?: Reservation[];
}
```

## 현재 상태

### 공통 모듈 (libs/modules)

- ✅ `Employee`: 기본 직원 정보 (메타데이터)
- ✅ `Department`: 부서 정보
- ✅ `Position`: 직책 정보
- ✅ `Rank`: 직급 정보
- ✅ `EmployeeDepartmentPosition`: 직원-부서-직책 관계

### LAMS 전용 (apps/lams/src/modules/domain)

- `DailyEventSummary`: 일일 출입 요약
- `EventInfo`: 출입 이벤트
- `AttendanceType`: 근태 유형
- `UsedAttendance`: 근태 사용 내역
- `MonthlyEventSummary`: 월간 요약
- 등등...

### LSMS 전용 (apps/lsms/src/domain)

- `Reservation`: 예약
- `Resource`: 자원
- `Schedule`: 일정
- `VehicleInfo`: 차량 정보
- 등등...

## 주의사항

1. **공통 모듈은 순수하게 유지**: 프로젝트별 의존성 제거
2. **관계는 각 프로젝트에서 정의**: 필요시 엔티티 확장 또는 별도 관리
3. **TypeORM의 `autoLoadEntities` 활용**: 각 프로젝트에서 필요한 엔티티만 로드
