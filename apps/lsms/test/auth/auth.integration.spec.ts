import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserControllers } from '../../src/modules/auth/infrastructure/adapters/in/domain/controllers/user.controllers';
import { UserAuthController } from '../../src/modules/auth/infrastructure/adapters/in/web/controllers/v1/auth.controller';
import { UserUserController } from '../../src/modules/auth/infrastructure/adapters/in/web/controllers/v1/user.controller';
import { UserService } from '../../src/modules/auth/application/services/user.service';
import { UserRepository } from '@resource/modules/auth/infrastructure/adapters/out/user.repository';
import { AuthService } from '@resource/modules/auth/domain/ports/auth.service.port';
import { UserUsecase } from '@resource/modules/auth/application/usecases/user.usecase';
import { getTestDbConfig, clearTestData, closeTestContainer } from '../test-db.config';
import { User } from '@libs/entities';
import { Role } from '@libs/enums/role-type.enum';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '@resource/modules/auth/application/dto/login.dto';
import { LoginResponseDto } from '@resource/modules/auth/application/dto/login-response.dto';
import { UserResponseDto } from '@resource/modules/auth/application/dto/user-response.dto';
import { UpdateNotificationSettingsDto } from '@resource/modules/auth/application/dto/notification-settings.dto';

jest.setTimeout(30000);

describe('Auth Integration Tests', () => {
    let app: INestApplication;
    let userService: UserService;
    let authService: AuthService;
    let userUsecase: UserUsecase;
    const testId = 'auth-integration-test';
    let testUser: User;
    let accessToken: string;

    beforeAll(async () => {
        try {
            const moduleFixture: TestingModule = await Test.createTestingModule({
                imports: [
                    TypeOrmModule.forRootAsync({
                        useFactory: () => getTestDbConfig(testId),
                    }),
                    TypeOrmModule.forFeature([User]),
                ],
                controllers: [UserControllers, UserAuthController, UserUserController],
                providers: [
                    UserService,
                    {
                        provide: 'UserRepositoryPort',
                        useClass: UserRepository,
                    },
                    {
                        provide: 'AuthService',
                        useValue: {
                            login: jest.fn(),
                        },
                    },
                    {
                        provide: UserUsecase,
                        useValue: {
                            findByUserId: jest.fn(),
                            checkPassword: jest.fn(),
                            changePassword: jest.fn(),
                            changeNotificationSettings: jest.fn(),
                        },
                    },
                ],
            }).compile();

            app = moduleFixture.createNestApplication();
            userService = moduleFixture.get<UserService>(UserService);
            authService = moduleFixture.get<AuthService>('AuthService');
            userUsecase = moduleFixture.get<UserUsecase>(UserUsecase);
            await app.init();

            // 도메인 API를 통해 테스트용 사용자 생성
            const response = await request(app.getHttpServer())
                .post('/domain/users')
                .send({
                    email: 'test@example.com',
                    password: 'password',
                    roles: [Role.USER],
                })
                .expect(201);

            testUser = response.body;
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

    describe('Auth Layer Tests', () => {
        it('should login and get access token', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'password',
            };

            const mockResponse: LoginResponseDto = {
                accessToken: 'mock-token',
                email: loginDto.email,
                roles: ['USER'],
                name: '홍길동',
                department: '개발팀',
                position: '개발자',
            };

            jest.spyOn(authService, 'login').mockResolvedValue(mockResponse);

            const response = await request(app.getHttpServer())
                .post('/v1/auth/login')
                .send(loginDto)
                .expect(201);

            expect(response.body).toEqual(mockResponse);
            accessToken = response.body.accessToken;
        });
    });

    describe('User API Tests', () => {
        it('should get user details', async () => {
            const mockUser: UserResponseDto = {
                userId: testUser.userId,
                email: testUser.email,
                roles: testUser.roles,
                mobile: testUser.mobile,
                name: '홍길동',
                department: '개발팀',
                position: '개발자',
                isPushNotificationEnabled: true,
            };

            jest.spyOn(userUsecase, 'findByUserId').mockResolvedValue(mockUser);

            const response = await request(app.getHttpServer())
                .get('/v1/users/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toEqual(mockUser);
        });

        it('should update notification settings', async () => {
            const updateDto: UpdateNotificationSettingsDto = {
                isPushNotificationEnabled: false,
            };

            const mockResponse: UserResponseDto = {
                userId: testUser.userId,
                email: testUser.email,
                roles: testUser.roles,
                mobile: testUser.mobile,
                name: '홍길동',
                department: '개발팀',
                position: '개발자',
                isPushNotificationEnabled: false,
            };

            jest.spyOn(userUsecase, 'changeNotificationSettings').mockResolvedValue(mockResponse);

            const response = await request(app.getHttpServer())
                .patch('/v1/users/me/notification-settings')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(updateDto)
                .expect(200);

            expect(response.body).toEqual(mockResponse);
        });
    });
}); 