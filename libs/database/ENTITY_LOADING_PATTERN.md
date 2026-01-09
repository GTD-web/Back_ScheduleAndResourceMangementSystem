# 엔티티 로딩 패턴

## 권장 방식: TypeOrmModule.forFeature() 사용

각 도메인 모듈에서 `TypeOrmModule.forFeature([Entity])`를 사용하면 `autoLoadEntities: true` 설정에 의해 자동으로 엔티티가 로드됩니다.

### 장점

1. **모듈화**: 각 도메인 모듈이 자신의 엔티티만 관리
2. **자동 로드**: `autoLoadEntities: true`로 자동 감지
3. **간단함**: AppModule에서 엔티티 배열을 관리할 필요 없음
4. **확장성**: 새로운 도메인 모듈 추가 시 자동으로 엔티티 로드

### 사용 방법

#### 1. DatabaseModule 설정

```typescript
// libs/database/database.module.ts
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfigService,
    }),
  ],
})
export class DatabaseModule {}
```

`DatabaseConfigService`에서 `autoLoadEntities: true` 설정:

```typescript
return {
  // ... 기타 설정
  autoLoadEntities: true, // 이 설정으로 자동 로드
};
```

#### 2. AppModule에서 DatabaseModule만 import

```typescript
// apps/lams/src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    DatabaseModule, // 엔티티 배열 전달 불필요
    // 각 도메인 모듈 import
    DomainEmployeeModule,
    DomainDepartmentModule,
    // ...
  ],
})
export class AppModule {}
```

#### 3. 각 도메인 모듈에서 엔티티 등록

```typescript
// apps/lams/src/modules/domain/employee/employee.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Employee])], // 여기서 엔티티 등록
  providers: [DomainEmployeeService, DomainEmployeeRepository],
  exports: [DomainEmployeeService, DomainEmployeeRepository],
})
export class DomainEmployeeModule {}
```

### 동작 원리

1. `DatabaseModule`이 `autoLoadEntities: true`로 설정됨
2. 각 도메인 모듈에서 `TypeOrmModule.forFeature([Entity])` 호출
3. TypeORM이 자동으로 해당 엔티티들을 감지하고 로드
4. 각 앱(LAMS, LSMS)에서 필요한 도메인 모듈만 import하면 해당 엔티티만 로드됨

### LAMS vs LSMS 엔티티 분리

- **LAMS**: `DomainEmployeeModule`, `DomainAttendanceTypeModule` 등 import → 해당 엔티티만 로드
- **LSMS**: `DomainResourceModule`, `DomainReservationModule` 등 import → 해당 엔티티만 로드
- **공유 엔티티**: `DomainEmployeeModule`, `DomainDepartmentModule` 등은 양쪽에서 import 가능

### 기존 방식과 비교

#### ❌ 기존 방식 (불필요)

```typescript
// app.module.ts
DatabaseModule.forRoot({
  entities: [Employee, Department, ...] // 모든 엔티티를 한 곳에서 관리
})
```

#### ✅ 권장 방식 (현재)

```typescript
// app.module.ts
DatabaseModule // 엔티티 배열 불필요

// 각 도메인 모듈
TypeOrmModule.forFeature([Employee]) // 각 모듈에서 관리
```

### 참고

- Back_ProjectManagementSystem에서도 동일한 패턴 사용
- NestJS 공식 문서에서도 권장하는 방식
- 더 모듈화되고 유지보수하기 쉬운 구조

