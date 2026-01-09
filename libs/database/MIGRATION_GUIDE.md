# Database Module 마이그레이션 가이드

## 변경 사항

### 1. DatabaseConfigService 추가

**새 파일**: `libs/database/database-config.service.ts`

`TypeOrmOptionsFactory`를 구현하여 TypeORM 설정을 생성하는 서비스입니다.

**장점:**
- 클래스 기반으로 더 명확한 구조
- 다른 모노레포와 동일한 패턴
- 환경 변수와 registerAs 설정 모두 지원

### 2. DatabaseModule 변경

**변경 전:**
```typescript
TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: typeOrmConfig,  // 함수 직접 사용
}),
```

**변경 후:**
```typescript
TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useClass: DatabaseConfigService,  // 클래스 사용
}),
```

### 3. AppModule 변경

**변경 전:**
```typescript
ConfigModule.forRoot({
    isGlobal: true,
    load: [DB_CONFIG, JWT_CONFIG],
}),
```

**변경 후:**
```typescript
ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ['.env.local', '.env'],  // 추가
    load: [DB_CONFIG, JWT_CONFIG],
}),
```

## 호환성

### 환경 변수 지원

`DatabaseConfigService`는 다음 두 가지 방식을 모두 지원합니다:

1. **registerAs로 등록된 설정** (기존 방식)
   ```typescript
   configService.get('database.host')
   ```

2. **직접 환경 변수** (새로운 방식)
   ```typescript
   configService.get('POSTGRES_HOST')
   ```

### 우선순위

1. `database.*` (registerAs 설정)
2. `POSTGRES_*` (직접 환경 변수)
3. 기본값

## 마이그레이션 체크리스트

- [x] `DatabaseConfigService` 생성
- [x] `DatabaseModule` 업데이트
- [x] `AppModule` 업데이트
- [x] 빌드 테스트 성공
- [ ] 실행 테스트 (DB 연결 확인)

## 참고

- 기존 `typeorm.config.ts`는 유지되지만 사용되지 않음
- 필요시 나중에 제거 가능
- 다른 모노레포(Back_ProjectManagementSystem)와 동일한 패턴 적용

