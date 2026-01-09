import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionManagerService } from './transaction-manager.service';
import { DatabaseService } from './database.service';
import { DatabaseConfigService } from './database-config.service';

/**
 * 데이터베이스 모듈
 *
 * TypeORM을 사용하여 PostgreSQL 데이터베이스 연결을 관리합니다.
 *
 * 엔티티는 각 도메인 모듈에서 `TypeOrmModule.forFeature([Entity])`로 등록하면
 * `autoLoadEntities: true` 설정에 의해 자동으로 로드됩니다.
 *
 * @example
 * ```typescript
 * // app.module.ts
 * DatabaseModule
 *
 * // domain/employee/employee.module.ts
 * TypeOrmModule.forFeature([Employee])
 * ```
 */
@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: DatabaseConfigService,
        }),
    ],
    providers: [TransactionManagerService, DatabaseService, DatabaseConfigService],
    exports: [TransactionManagerService, DatabaseService, TypeOrmModule],
})
export class DatabaseModule {}
