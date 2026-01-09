# Database Module

데이터베이스 연결 및 트랜잭션 관리를 담당하는 모듈입니다.

## 구조

```
database/
├── database.module.ts           # Database 모듈 (TypeORM 설정)
├── database-config.service.ts   # TypeORM 설정 서비스 (TypeOrmOptionsFactory 구현)
├── database.service.ts          # Database 서비스
├── transaction-manager.service.ts # 트랜잭션 관리 서비스
├── base/                        # Base Entity 및 Repository
└── interfaces/                  # 인터페이스
```

## 사용 방법

### 1. App Module에서 설정

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@libs/database/database.module';
import { DB_CONFIG, JWT_CONFIG } from '@libs/configs/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [DB_CONFIG, JWT_CONFIG],
    }),
    DatabaseModule,
  ],
})
export class AppModule {}
```

### 2. DatabaseConfigService

`DatabaseConfigService`는 `TypeOrmOptionsFactory`를 구현하여 TypeORM 설정을 생성합니다.

**특징:**
- 환경 변수 직접 읽기 지원 (`POSTGRES_HOST`, `POSTGRES_PORT` 등)
- `registerAs`로 등록된 설정도 지원 (`database.host`, `database.port` 등)
- 개발/운영 환경에 따른 자동 설정
- 연결 풀, 재시도, 캐시 등 고급 설정 포함

**환경 변수 우선순위:**
1. `database.*` (registerAs로 등록된 설정)
2. `POSTGRES_*` (직접 환경 변수)
3. 기본값

### 3. 환경 변수

```env
# 데이터베이스 설정
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=admin
POSTGRES_PASSWORD=tech7admin!
POSTGRES_DB=rms-test
POSTGRES_SCHEMA=public

# 또는 registerAs로 등록된 설정 사용
# (libs/configs/env.config.ts의 DB_CONFIG 사용)
```

## 주요 변경사항

### Before (기존 방식)
- `typeorm.config.ts`에서 함수로 설정 반환
- `database.module.ts`에서 `useFactory`로 함수 직접 사용

### After (개선된 방식)
- `DatabaseConfigService` 클래스로 설정 관리
- `TypeOrmOptionsFactory` 인터페이스 구현
- 더 명확한 구조와 유지보수성 향상
- 다른 모노레포(Back_ProjectManagementSystem)와 동일한 패턴

## 참고

- Back_ProjectManagementSystem의 `database-config.service.ts` 패턴을 참고하여 구현
- 환경 변수와 `registerAs` 설정 모두 지원하여 유연성 확보

