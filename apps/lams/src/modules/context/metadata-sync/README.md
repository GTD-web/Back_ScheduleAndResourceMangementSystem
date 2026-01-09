# MetadataSync Context

메타데이터(조직, 직원 정보) 동기화를 위한 컨텍스트 모듈입니다.

## 역할

여러 도메인 서비스를 조합하여 메타데이터 동기화 관련 비즈니스 로직을 구현합니다.

## 주요 기능

### 1. syncPositions(positions)

직책 정보 동기화

### 2. syncRanks(ranks)

직급 정보 동기화

### 3. syncDepartments(departments)

부서 정보 동기화 (계층 구조 순서 보장)

### 4. syncEmployees(employees)

직원 정보 동기화

### 5. syncEmployeeDepartmentPositions(employeeDepartmentPositions)

직원-부서-직책 매핑 정보 동기화

### 6. syncAllMetadata(data)

전체 메타데이터를 순서에 맞게 일괄 동기화

## 사용 예시 (Application Layer)

```typescript
// usecase에서 사용
@Injectable()
export class SyncAllMetadataUsecase {
    constructor(private readonly metadataSyncContext: MetadataSyncContext) {}

    async execute(data: ExportAllDataResponseDto): Promise<void> {
        // 전체 메타데이터 동기화
        await this.metadataSyncContext.syncAllMetadata({
            positions: data.positions,
            ranks: data.ranks,
            departments: data.departments,
            employees: data.employees,
            employeeDepartmentPositions: data.employeeDepartmentPositions,
        });
    }
}
```

## 의존성

### Domain Services (modules_v2/domain)

- DomainPositionService
- DomainRankService
- DomainDepartmentService
- DomainEmployeeService
- DomainEmployeeDepartmentPositionService

## 동기화 순서

메타데이터는 참조 관계를 고려하여 다음 순서로 동기화됩니다:

1. **Position** (독립)
2. **Rank** (독립)
3. **Department** (자기 참조, order 순으로 정렬)
4. **Employee** (Rank 참조)
5. **EmployeeDepartmentPosition** (Employee, Department, Position 참조)

## 에러 처리

- 각 항목별 동기화 실패 시 로그를 남기고 예외를 throw
- 전체 동기화 프로세스는 트랜잭션으로 관리 가능 (필요시 추가)
