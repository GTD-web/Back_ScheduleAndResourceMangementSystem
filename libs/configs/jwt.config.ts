import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = (configService: ConfigService): JwtModuleOptions => {
    const secret = configService.get<string>('jwt.secret') || configService.get<string>('GLOBAL_SECRET');
    const expiresIn = configService.get<string>('jwt.expiresIn');

    return {
        secret,
        signOptions: {
            ...(expiresIn && { expiresIn }), // expiresIn이 있을 때만 설정
        },
    };
};
