# Employee 모듈 전략

## 현재 상황

1. **공통 모듈**: `libs/modules/employee` - LAMS와 LSMS에서 공유
2. **LAMS 전용 모듈**: `apps/lams/src/modules/domain/employee` - LAMS 전용 기능 포함

## 문제점

- 두 개의 Employee 엔티티가 존재 (중복)
- LAMS 전용 관계(`DailyEventSummary`)를 추가하려면 LAMS에서 별도 모듈 필요

## 해결 방법

### 방법 1: libs 모듈 직접 사용 + 관계는 역방향으로만 정의 (권장)

**장점:**

- 코드 중복 없음
- libs 모듈을 직접 사용
- 관계는 DailyEventSummary에서만 정의

**구조:**

```typescript
// libs/modules/employee/employee.entity.ts (공통)
export class Employee {
    // 기본 필드만
    // DailyEventSummary 관계 없음
}

// apps/lams/src/modules/domain/daily-event-summary/daily-event-summary.entity.ts
import { Employee } from '@libs/modules/employee/employee.entity';

@Entity('daily_event_summaries')
export class DailyEventSummary {
    @ManyToOne(() => Employee, ...)
    employee: Employee; // 역방향 관계만 정의
}

// Employee에서 OneToMany는 필요 없음 (TypeORM이 자동으로 역방향 관계 인식)
```

**사용:**

```typescript
// apps/lams/src/app.module.ts
import { DomainEmployeeModule } from '@libs/modules/employee/employee.module';
// libs 모듈 직접 사용
```

### 방법 2: LAMS에서 Employee 확장 (현재 방식 유지)

**장점:**

- LAMS 전용 관계를 Employee에 명시적으로 정의 가능
- OneToMany 관계를 Employee에서 관리

**구조:**

```typescript
// libs/modules/employee/employee.entity.ts (공통)
export class Employee {
    // 기본 필드만
}

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

**주의사항:**

- TypeORM에서 같은 테이블에 대해 두 개의 엔티티 클래스를 사용하면 충돌 가능
- `@Entity('employees')` 데코레이터가 중복되면 문제 발생

### 방법 3: libs 모듈 사용 + LAMS에서 별도 관계 엔티티 (복잡함)

별도 관계 테이블을 만들어서 관리 (과도한 복잡성)

## 권장 방법: 방법 1

**이유:**

1. 코드 중복 최소화
2. libs 모듈을 직접 사용하여 일관성 유지
3. TypeORM은 역방향 관계를 자동으로 인식
4. 각 프로젝트에서 필요한 관계만 정의

**구현:**

- `libs/modules/employee` 모듈을 직접 import
- `DailyEventSummary`에서만 `ManyToOne` 관계 정의
- Employee에서 `OneToMany`는 필요 없음 (TypeORM이 자동 처리)
