import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@libs/database/database.module';
import { DomainModule } from './refactoring/domain/domain.module';
import { InterfaceModule } from './refactoring/interface/interface.module';
import * as path from 'path';
import { DB_CONFIG, JWT_CONFIG, SSO_CONFIG } from '../libs/configs/env.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../libs/guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '@libs/configs/jwt.config';
import { JwtStrategy } from '../libs/strategies/jwt.strategy';
import { OrganizationMigrationModule } from './refactoring/integrations/migration/migration.module';
import { InitModule } from './refactoring/integrations/init/init.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [path.resolve('apps', 'lams', '.env')],
            load: [DB_CONFIG, JWT_CONFIG, SSO_CONFIG],
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            global: true,
            useFactory: jwtConfig,
            inject: [ConfigService],
        }),
        DatabaseModule,
        DomainModule, // refactoring/domain의 모든 도메인 모듈 통합
        InterfaceModule, // 인터페이스 모듈 (API 엔드포인트)
        OrganizationMigrationModule,
        InitModule, // 기본 데이터 초기화 모듈
    ],
    controllers: [],
    providers: [
        JwtStrategy, // JWT 전략 등록
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
