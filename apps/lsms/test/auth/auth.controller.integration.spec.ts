import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuthController } from '../../src/modules/auth/infrastructure/adapters/in/web/controllers/v1/auth.controller';
import { AuthService } from '@resource/modules/auth/domain/ports/auth.service.port';
import { getTestDbConfig, clearTestData, closeTestContainer } from '../test-db.config';
import { User } from '@libs/entities';
import { LoginDto } from '@resource/modules/auth/application/dto/login.dto';
import { LoginResponseDto } from '@resource/modules/auth/application/dto/login-response.dto';

jest.setTimeout(30000);

describe('UserAuthController (e2e)', () => {
    let app: INestApplication;
    let authService: AuthService;
    const testId = 'auth-controller-test';

    beforeAll(async () => {
        try {
            const moduleFixture: TestingModule = await Test.createTestingModule({
                imports: [
                    TypeOrmModule.forRootAsync({
                        useFactory: () => getTestDbConfig(testId),
                    }),
                    TypeOrmModule.forFeature([User]),
                ],
                controllers: [UserAuthController],
                providers: [
                    {
                        provide: 'AuthService',
                        useValue: {
                            login: jest.fn(),
                        },
                    },
                ],
            }).compile();

            app = moduleFixture.createNestApplication();
            authService = moduleFixture.get<AuthService>('AuthService');
            await app.init();
        } catch (error) {
            console.error('Error during test setup:', error);
            throw error;
        }
    });

    afterAll(async () => {
        try {
            if (app) {
                await app.close();
            }
            await clearTestData(testId);
            await closeTestContainer(testId);
        } catch (error) {
            console.error('Error during test cleanup:', error);
        }
    });

    describe('POST /v1/auth/login', () => {
        it('should return login response', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'password',
            };

            const mockResponse: LoginResponseDto = {
                accessToken: 'mock-token',
                email: loginDto.email,
                name: 'Test User',
                roles: ['USER'],
                department: '개발팀',
                position: '개발자',
            };

            jest.spyOn(authService, 'login').mockResolvedValue(mockResponse);

            const response = await request(app.getHttpServer())
                .post('/v1/auth/login')
                .send(loginDto)
                .expect(201);

            expect(response.body).toEqual(mockResponse);
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });
}); 