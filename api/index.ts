import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { setupSwagger } from '../libs/swagger/swagger';
import * as businessDtos from '../src/business.dto.index';
import { JwtAuthGuard } from '../libs/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RolesGuard } from '../libs/guards/role.guard';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';

const server = express();
let cachedApp: NestExpressApplication;

async function bootstrapServer() {
    if (cachedApp) {
        return cachedApp;
    }

    const expressAdapter = new ExpressAdapter(server);
    const app = await NestFactory.create<NestExpressApplication>(AppModule, expressAdapter);

    const isProduction = process.env.NODE_ENV === 'production';
    app.enableCors({
        origin: isProduction
            ? function (origin, callback) {
                  const whitelist = [
                      'https://portal.lumir.space',
                      'https://lsms.lumir.space',
                      'https://lrms.lumir.space',
                      'https://rms-backend-iota.vercel.app',
                      'https://lrms-dev.lumir.space',
                      'https://lrim.lumir.space',
                      'http://localhost:3002',
                  ];
                  if (!isProduction || !origin || whitelist.includes(origin)) {
                      callback(null, true);
                  } else {
                      callback(new Error('Not allowed by CORS'));
                  }
              }
            : true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    app.setGlobalPrefix('api');
    app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)), new RolesGuard(app.get(Reflector)));
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // 파일 업로드 설정
    const uploadPath = join(__dirname, '..', 'public');
    app.useStaticAssets(uploadPath, {
        prefix: '/static',
    });

    setupSwagger(app, [...Object.values(businessDtos)]);

    await app.init();
    cachedApp = app;
    return app;
}

export default async (req: express.Request, res: express.Response) => {
    await bootstrapServer();
    server(req, res);
};

