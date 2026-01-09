import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserControllers } from '../../src/modules/auth/infrastructure/adapters/in/domain/controllers/user.controllers';
import { UserService } from '../../src/modules/auth/application/services/user.service';
import { UserRepository } from '@resource/modules/auth/infrastructure/adapters/out/user.repository';
import { getTestDbConfig, clearTestData, closeTestContainer } from '../test-db.config';
import { User } from '@libs/entities';
import { Role } from '@libs/enums/role-type.enum';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

jest.setTimeout(30000); // 30초 타임아웃 설정

describe('UserControllers (e2e)', () => {
    let app: INestApplication;
    let userService: UserService;
    const testId = 'domain-user-controllers-test';

    beforeAll(async () => {
        try {
            const moduleFixture: TestingModule = await Test.createTestingModule({
                imports: [
                    TypeOrmModule.forRootAsync({
                        useFactory: () => getTestDbConfig(testId),
                    }),
                    TypeOrmModule.forFeature([User]),
                ],
                controllers: [UserControllers],
                providers: [
                    UserService,
                    {
                        provide: 'UserRepositoryPort',
                        useClass: UserRepository,
                    },
                ],
            }).compile();

            app = moduleFixture.createNestApplication();
            userService = moduleFixture.get<UserService>(UserService);
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

    describe('GET /domain/users', () => {
        it('should return all users', async () => {
            const response = await request(app.getHttpServer())
                .get('/domain/users')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('GET /domain/users/:userId', () => {
        it('should return a user by userId', async () => {
            const testUser = await userService.save({
                email: 'test@example.com',
                password: await bcrypt.hash('password', 10),
                roles: [Role.USER],
            } as User);

            const response = await request(app.getHttpServer())
                .get(`/domain/users/${testUser.userId}`)
                .expect(200);

            expect(response.body.email).toBe('test@example.com');
            expect(response.body.roles).toEqual([Role.USER]);
        });

        it('should return nothing for non-existent user', async () => {
            const response = await request(app.getHttpServer())
                .get(`/domain/users/${uuidv4()}`)
                .expect(200);

            expect(response.body).toEqual({});
        });
    });

    describe('POST /domain/users', () => {
        it('should create a new user', async () => {
            const newUser = {
                email: 'new@example.com',
                password: 'password',
                roles: [Role.USER],
            };

            const response = await request(app.getHttpServer())
                .post('/domain/users')
                .send(newUser)
                .expect(201);

            expect(response.body.email).toBe(newUser.email);
            expect(response.body.roles).toEqual(newUser.roles);
            expect(response.body.userId).toBeDefined();
        });
    });

    describe('PATCH /domain/users/:userId', () => {
        it('should update a user', async () => {
            const testUser = await userService.save({
                email: 'update@example.com',
                password: await bcrypt.hash('password', 10),
                roles: [Role.USER],
            } as User);

            const updateData = {
                email: 'updated@example.com',
                roles: [Role.USER, Role.RESOURCE_ADMIN],
            };

            const response = await request(app.getHttpServer())
                .patch(`/domain/users/${testUser.userId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.email).toBe(updateData.email);
            expect(response.body.roles).toEqual(updateData.roles);
        });
    });
}); 