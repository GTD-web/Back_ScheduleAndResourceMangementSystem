import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

/**
 * E2E 테스트 헬퍼 유틸리티
 */
export class TestHelpers {
    /**
     * SSO 로그인을 통해 실제 JWT 토큰을 생성한다
     *
     * @param app NestJS 애플리케이션 인스턴스
     * @param email 이메일 (기본값: 환경 변수에서 가져옴)
     * @param password 비밀번호 (기본값: 환경 변수에서 가져옴)
     * @returns JWT 토큰
     */
    static async createTokenFromSSOLogin(
        app: INestApplication,
        email?: string,
        password?: string,
    ): Promise<string> {
        // 우선 JwtService를 사용하여 실제 유효한 토큰 생성 (가장 확실한 방법)
        try {
            const token = this.createValidJwtToken(app);
            if (token && !token.startsWith('mock-token')) {
                return token;
            }
        } catch (error) {
            console.warn('⚠️ JwtService 토큰 생성 실패, SSO 로그인 시도');
        }

        // JwtService 실패 시 SSO 로그인 시도
        const configService = app.get(ConfigService);
        const testEmail = email || configService.get<string>('TEST_EMAIL') || 'test@example.com';
        const testPassword = password || configService.get<string>('TEST_PASSWORD') || 'test1234';

        try {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: testEmail,
                    password: testPassword,
                })
                .expect(201);

            return response.body.token;
        } catch (error) {
            console.warn(
                `⚠️ SSO 로그인 실패 (${testEmail}). 모킹 토큰을 사용합니다.`,
            );
            // 모든 방법 실패 시 모킹 토큰 반환
            return this.createMockToken();
        }
    }

    /**
     * JwtService를 사용하여 실제 유효한 JWT 토큰을 생성한다
     *
     * @param app NestJS 애플리케이션 인스턴스
     * @returns 유효한 JWT 토큰
     */
    static createValidJwtToken(app: INestApplication): string {
        try {
            const jwtService = app.get(JwtService, { strict: false });
            if (!jwtService) {
                throw new Error('JwtService를 찾을 수 없습니다.');
            }
            const payload = {
                id: 'test-user-id',
                employeeNumber: 'TEST001',
                name: '테스트 사용자',
                email: 'test@example.com',
            };
            const token = jwtService.sign(payload);
            console.log('✅ JwtService를 사용하여 테스트용 토큰 생성 성공');
            return token;
        } catch (error: any) {
            console.warn(`⚠️ JwtService를 사용한 토큰 생성 실패: ${error.message}. 모킹 토큰을 사용합니다.`);
            return this.createMockToken();
        }
    }

    /**
     * 인증 토큰을 생성한다 (모킹용)
     * 실제 JWT 토큰 생성 로직이 필요하면 구현
     */
    static createMockToken(userId: string = 'test-user-id', employeeId: string = 'test-employee-id'): string {
        // 실제 구현에서는 JWT 서비스를 사용하여 토큰 생성
        // 현재는 모킹된 토큰 반환
        return `mock-token-${userId}-${employeeId}`;
    }

    /**
     * 인증 헤더를 생성한다
     */
    static createAuthHeaders(token?: string): { Authorization: string } {
        return {
            Authorization: `Bearer ${token || this.createMockToken()}`,
        };
    }

    /**
     * GET 요청을 보낸다
     */
    static async get(
        app: INestApplication,
        path: string,
        token?: string,
        query?: Record<string, string>,
    ): Promise<request.Response> {
        const req = request(app.getHttpServer()).get(path);
        if (token) {
            req.set('Authorization', `Bearer ${token}`);
        }
        if (query) {
            req.query(query);
        }
        return req;
    }

    /**
     * POST 요청을 보낸다
     */
    static async post(
        app: INestApplication,
        path: string,
        body?: any,
        token?: string,
    ): Promise<request.Response> {
        const req = request(app.getHttpServer()).post(path);
        if (token) {
            req.set('Authorization', `Bearer ${token}`);
        }
        if (body) {
            req.send(body);
        }
        return req;
    }

    /**
     * PATCH 요청을 보낸다
     */
    static async patch(
        app: INestApplication,
        path: string,
        body?: any,
        token?: string,
    ): Promise<request.Response> {
        const req = request(app.getHttpServer()).patch(path);
        if (token) {
            req.set('Authorization', `Bearer ${token}`);
        }
        if (body) {
            req.send(body);
        }
        return req;
    }

    /**
     * DELETE 요청을 보낸다
     */
    static async delete(
        app: INestApplication,
        path: string,
        body?: any,
        token?: string,
    ): Promise<request.Response> {
        const req = request(app.getHttpServer()).delete(path);
        if (token) {
            req.set('Authorization', `Bearer ${token}`);
        }
        if (body) {
            req.send(body);
        }
        return req;
    }

    /**
     * 파일 업로드 요청을 보낸다
     */
    static async uploadFile(
        app: INestApplication,
        path: string,
        file: Express.Multer.File | Buffer,
        fileName: string = 'test.xlsx',
        token?: string,
        additionalFields?: Record<string, string>,
    ): Promise<request.Response> {
        const req = request(app.getHttpServer()).post(path);
        if (token) {
            req.set('Authorization', `Bearer ${token}`);
        }
        if (file instanceof Buffer) {
            req.attach('file', file, fileName);
        } else {
            // Express.Multer.File의 buffer를 Buffer로 변환
            const buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
            req.attach('file', buffer, fileName);
        }
        if (additionalFields) {
            Object.entries(additionalFields).forEach(([key, value]) => {
                req.field(key, value);
            });
        }
        return req;
    }
}
