import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserUserController } from '../../src/modules/auth/infrastructure/adapters/in/web/controllers/v1/user.controller';
import { UserUsecase } from '@resource/modules/auth/application/usecases/user.usecase';
import { getTestDbConfig, clearTestData, closeTestContainer } from '../test-db.config';
import { User } from '@libs/entities';
import { CheckPasswordDto } from '@resource/modules/auth/application/dto/check-password.dto';
import { ChangePasswordDto } from '@resource/modules/auth/application/dto/change-password.dto';
import { UpdateNotificationSettingsDto } from '@resource/modules/auth/application/dto/notification-settings.dto';
import { UserResponseDto } from '@resource/modules/auth/application/dto/user-response.dto';

jest.setTimeout(30000);

describe('UserUserController (e2e)', () => {
    let app: INestApplication;
    let userUsecase: UserUsecase;
    const testId = 'user-controller-test';

    beforeAll(async () => {
        try {
            const moduleFixture: TestingModule = await Test.createTestingModule({
                imports: [
                    TypeOrmModule.forRootAsync({
                        useFactory: () => getTestDbConfig(testId),
                    }),
                    TypeOrmModule.forFeature([User]),
                ],
                controllers: [UserUserController],
                providers: [
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
            userUsecase = moduleFixture.get<UserUsecase>(UserUsecase);
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

    describe('GET /v1/users/me', () => {
        it('should return user details', async () => {
            const mockUser: UserResponseDto = {
                userId: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
                roles: ['USER'],
                department: '개발팀',
                position: '개발자',
                mobile: '01012345678',
                isPushNotificationEnabled: true,
            };

            jest.spyOn(userUsecase, 'findByUserId').mockResolvedValue(mockUser);

            const response = await request(app.getHttpServer())
                .get('/v1/users/me')
                .set('Authorization', 'Bearer test-token')
                .expect(200);

            expect(response.body).toEqual(mockUser);
            expect(userUsecase.findByUserId).toHaveBeenCalledWith('test-user-id');
        });
    });

    describe('POST /v1/users/check-password', () => {
        it('should check password and return result', async () => {
            const checkPasswordDto: CheckPasswordDto = {
                password: 'test-password',
            };

            jest.spyOn(userUsecase, 'checkPassword').mockResolvedValue(true);

            const response = await request(app.getHttpServer())
                .post('/v1/users/check-password')
                .set('Authorization', 'Bearer test-token')
                .send(checkPasswordDto)
                .expect(200);

            expect(response.body).toEqual({ result: true });
            expect(userUsecase.checkPassword).toHaveBeenCalledWith('test-user-id', checkPasswordDto.password);
        });
    });

    describe('POST /v1/users/change-password', () => {
        it('should change password', async () => {
            const changePasswordDto: ChangePasswordDto = {
                newPassword: 'new-password',
            };

            jest.spyOn(userUsecase, 'changePassword').mockResolvedValue(undefined);

            await request(app.getHttpServer())
                .post('/v1/users/change-password')
                .set('Authorization', 'Bearer test-token')
                .send(changePasswordDto)
                .expect(200);

            expect(userUsecase.changePassword).toHaveBeenCalledWith('test-user-id', changePasswordDto.newPassword);
        });
    });

    describe('PATCH /v1/users/me/notification-settings', () => {
        it('should update notification settings', async () => {
            const updateDto: UpdateNotificationSettingsDto = {
                isPushNotificationEnabled: false,
            };

            const mockResponse: UserResponseDto = {
                userId: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
                roles: ['USER'],
                department: '개발팀',
                position: '개발자',
                mobile: '01012345678',
                isPushNotificationEnabled: false,
            };

            jest.spyOn(userUsecase, 'changeNotificationSettings').mockResolvedValue(mockResponse);

            const response = await request(app.getHttpServer())
                .patch('/v1/users/me/notification-settings')
                .set('Authorization', 'Bearer test-token')
                .send(updateDto)
                .expect(200);

            expect(response.body).toEqual(mockResponse);
            expect(userUsecase.changeNotificationSettings).toHaveBeenCalledWith('test-user-id', updateDto);
        });
    });
}); 