# Employee 모듈 마이그레이션 가이드

## 현재 상황

- `libs/modules/employee` - 공통 모듈 (LAMS, LSMS 공유)
- `apps/lams/src/modules/domain/employee` - LAMS 전용 모듈 (중복)

## 권장 방법: libs 모듈 직접 사용

### 이유

1. **코드 중복 제거**: Employee 엔티티가 두 곳에 존재하는 것은 유지보수에 불리
2. **관계는 역방향으로 충분**: `DailyEventSummary`에서 `ManyToOne`으로 Employee를 참조하면, TypeORM이 자동으로 역방향 관계를 인식
3. **일관성**: libs 모듈을 직접 사용하여 두 프로젝트 간 일관성 유지

### TypeORM 관계 동작

```typescript
// DailyEventSummary에서
@ManyToOne(() => Employee, ...)
employee: Employee;

// 이것만으로도 충분합니다!
// Employee에서 OneToMany를 정의하지 않아도
// TypeORM이 자동으로 역방향 관계를 인식합니다.
```

### 마이그레이션 단계

1. **libs 모듈 import로 변경**
   ```typescript
   // 기존
   import { DomainEmployeeModule } from './modules/domain/employee/employee.module';
   
   // 변경
   import { DomainEmployeeModule } from '@libs/modules/employee/employee.module';
   ```

2. **DailyEventSummary는 그대로 유지**
   - `DailyEventSummary`에서 `Employee`를 참조하는 것은 문제 없음
   - `@libs/modules/employee/employee.entity`를 import하여 사용

3. **LAMS 전용 Employee 모듈 제거 또는 확장용으로만 사용**
   - 필요시 확장용으로만 사용
   - 기본적으로는 libs 모듈 사용

### 주의사항

- 같은 테이블에 대해 두 개의 `@Entity('employees')` 데코레이터가 있으면 충돌 가능
- libs 모듈을 사용하면 LAMS 전용 Employee는 제거하거나 확장용으로만 사용

