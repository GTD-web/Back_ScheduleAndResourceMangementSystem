import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { setupSwagger } from '../libs/swagger/swagger';
import * as businessDtos from '../src/business.dto.index';
import { JwtAuthGuard } from '../libs/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RolesGuard } from '../libs/guards/role.guard';
import { join } from 'path';

let cachedApp: NestExpressApplication;

async function createApp(): Promise<NestExpressApplication> {
    if (!cachedApp) {
        console.log('Creating new NestJS app for Vercel...');

        const app = await NestFactory.create<NestExpressApplication>(AppModule);

        // CORS setup
        const ALLOW_ORIGINS = [
            'https://portal.lumir.space',
            'https://lsms.lumir.space',
            'https://lrms.lumir.space',
            'https://rms-backend-iota.vercel.app',
            'https://rms-backend-lumir-web-dev.vercel.app',
            'https://rms-backend-git-dev-lumir-web-dev.vercel.app',
            'https://lrms-dev.lumir.space',
            'https://lrim.lumir.space',
            'http://localhost:3002',
        ];

        app.enableCors({
            origin: function (origin, callback) {
                const whitelist = ALLOW_ORIGINS;
                // origin이 없으면 허용 (Postman, 서버 간 요청 등)
                if (!origin || whitelist.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });

        // Global pipes
        app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: false,
            }),
        );

        // API 프리픽스 설정
        app.setGlobalPrefix('api');

        // Global guards
        app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)), new RolesGuard(app.get(Reflector)));

        // Static assets 설정 (Vercel 환경에서 경로 조정)
        try {
            const uploadPath = join(__dirname, '..', 'public');
            app.useStaticAssets(uploadPath, {
                prefix: '/static',
            });
        } catch (error) {
            console.warn('Static assets setup failed in Vercel environment:', error.message);
        }

        // Swagger setup
        setupSwagger(app, [...Object.values(businessDtos)]);

        await app.init();
        cachedApp = app;

        console.log('NestJS app created and initialized for Vercel');
    }

    return cachedApp;
}

// Vercel용 handler export
export default async function handler(req: any, res: any) {
    try {
        const app = await createApp();
        const server = app.getHttpAdapter().getInstance();

        // Express 서버를 Vercel handler로 래핑
        return server(req, res);
    } catch (error) {
        console.error('Vercel handler error:', error);

        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message || 'Unknown error occurred',
        });
    }
}
