# Employee 모듈 사용 가이드

## 질문: LAMS에서 따로 모듈을 만들어야 하나?

**답변: 아니요, 꼭 그럴 필요는 없습니다!**

## 두 가지 방법

### 방법 1: libs 모듈 직접 사용 (권장) ✅

**장점:**
- 코드 중복 없음
- 일관성 유지
- 유지보수 용이

**구조:**
```typescript
// DailyEventSummary에서
import { Employee } from '@libs/modules/employee/employee.entity';

@ManyToOne(() => Employee, ...)
employee: Employee;

// 이것만으로 충분! TypeORM이 자동으로 역방향 관계 인식
// Employee에서 OneToMany 정의 불필요
```

**사용:**
```typescript
// app.module.ts
import { DomainEmployeeModule } from '@libs/modules/employee/employee.module';
```

### 방법 2: LAMS 전용 모듈 유지 (현재 방식)

**장점:**
- LAMS 전용 필드나 관계를 명시적으로 정의 가능
- 프로젝트별 커스터마이징 용이

**단점:**
- 코드 중복
- 두 곳에서 관리 필요

**구조:**
```typescript
// apps/lams/src/modules/domain/employee/employee.entity.ts
// libs의 Employee를 확장하거나 재정의
```

## TypeORM 관계 동작 원리

TypeORM은 `ManyToOne`만 있어도 역방향 관계를 자동으로 인식합니다:

```typescript
// DailyEventSummary에서
@ManyToOne(() => Employee, ...)
employee: Employee;

// Employee에서 OneToMany를 정의하지 않아도
// TypeORM이 자동으로 역방향 관계를 인식하여
// employee.dailyEventSummary로 접근 가능
```

## 권장 방법

**방법 1 (libs 모듈 직접 사용)**을 권장합니다:

1. `DailyEventSummary`에서 `@libs/modules/employee/employee.entity` 참조
2. `app.module.ts`에서 `@libs/modules/employee/employee.module` import
3. LAMS 전용 Employee 모듈은 제거하거나 확장용으로만 사용

이렇게 하면:
- 코드 중복 제거
- 공통 모듈 일관성 유지
- TypeORM이 자동으로 관계 처리

