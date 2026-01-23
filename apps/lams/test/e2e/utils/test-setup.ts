import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AppModule } from '../../../src/app.module';
import { JwtAuthGuard } from '../../../libs/guards/jwt-auth.guard';
import { JwtStrategy } from '../../../libs/strategies/jwt.strategy';
import { DataSource } from 'typeorm';
import { InitService } from '../../../src/refactoring/integrations/init/init.service';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';

/**
 * 테스트용 JWT 전략
 * 실제 JWT 토큰을 추출하고 검증합니다.
 */
class TestJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService?: ConfigService) {
        const secret =
            configService?.get<string>('jwt.secret') ||
            configService?.get<string>('GLOBAL_SECRET') ||
            'test-secret-key';
        
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        // payload가 없어도 기본값 반환 (테스트 환경)
        if (!payload || !payload.employeeNumber) {
            return {
                id: 'test-user-id',
                employeeNumber: 'TEST001',
                name: '테스트 사용자',
                email: 'test@example.com',
            };
        }
        
        // payload를 그대로 반환
        return {
            id: payload.id || payload.employeeNumber,
            employeeNumber: payload.employeeNumber,
            name: payload.name,
            email: payload.email,
            ...payload,
        };
    }
}

/**
 * 테스트용 JWT 인증 가드
 * 항상 인증을 성공시키고 테스트용 사용자 정보를 주입합니다.
 */
class TestJwtAuthGuard extends JwtAuthGuard {
    constructor(reflector: Reflector) {
        super(reflector);
    }

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        // 테스트용 사용자 정보 주입
        request.user = {
            id: 'test-user-id',
            employeeNumber: 'TEST001',
            name: '테스트 사용자',
            email: 'test@example.com',
        };
        return true;
    }
}

/**
 * E2E 테스트 설정 유틸리티
 */
export class TestSetup {
    /**
     * 테스트 애플리케이션을 생성한다
     */
    static async createTestApp(): Promise<INestApplication> {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(JwtStrategy)
            .useClass(TestJwtStrategy)
            .overrideProvider(APP_GUARD)
            .useClass(TestJwtAuthGuard)
            .overrideGuard(JwtAuthGuard)
            .useClass(TestJwtAuthGuard)
            .compile();

        const app = moduleFixture.createNestApplication();
        const reflector = app.get(Reflector);
        app.useGlobalGuards(new TestJwtAuthGuard(reflector));
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        await app.init();

        // 초기 데이터 확인 및 생성
        try {
            const initService = app.get(InitService, { strict: false });
            if (initService && typeof initService.onApplicationBootstrap === 'function') {
                await initService.onApplicationBootstrap();
            }
        } catch (error) {
            // InitService가 없거나 실행할 수 없는 경우 무시
            console.warn('⚠️ InitService 실행 실패 (무시됨):', error.message);
        }

        return app;
    }

    /**
     * 테스트 애플리케이션을 종료한다
     */
    static async closeTestApp(app?: INestApplication): Promise<void> {
        if (!app) {
            return;
        }
        try {
            // 데이터베이스 연결 정리
            const dataSource = app.get(DataSource, { strict: false });
            if (dataSource && dataSource.isInitialized) {
                await dataSource.destroy();
            }
        } catch (error) {
            // DataSource가 없거나 이미 종료된 경우 무시
            console.warn('⚠️ DataSource 정리 실패 (무시됨):', error.message);
        }

        await app.close();
    }
}
