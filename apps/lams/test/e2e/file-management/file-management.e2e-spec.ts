import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import * as path from 'path';
import { Employee, EmployeeStatus } from '../../../../../libs/modules/employee/employee.entity';
import { TestSetup } from '../utils/test-setup';
import { TestHelpers } from '../utils/test-helpers';
import { TestDataBuilder } from '../utils/test-data-builder';
import * as request from 'supertest';

describe('FileManagementController (e2e)', () => {
    let app: INestApplication;
    let authToken: string;
    let testData: TestDataBuilder;
    const testFileIds: string[] = [];
    let testEmployeeId: string | null = null;
    let testReflectionHistoryId: string | null = null;
    const testYear = '2025';
    const testMonth = '11';
    const attendanceRequestFileName = '근태신청관리리스트_212.xlsx';
    const attendanceEventFileName = '전체출입내역_11월.xlsx';
    const attendanceRequestFilePath = path.resolve(process.cwd(), 'storage', 'local-files', attendanceRequestFileName);
    const attendanceEventFilePath = path.resolve(process.cwd(), 'storage', 'local-files', attendanceEventFileName);

    beforeAll(async () => {
        app = await TestSetup.createTestApp();
        // JwtService를 사용하여 실제 유효한 토큰 생성
        authToken = TestHelpers.createValidJwtToken(app);
        testData = new TestDataBuilder(app);
        const dataSource = app.get<DataSource>(DataSource);

        // 테스트에 필요한 실제 데이터 조회
        const employee = await testData.getEmployee();

        if (employee) {
            testEmployeeId = employee.id;
        } else {
            const newEmployee = dataSource.manager.create(Employee, {
                id: randomUUID(),
                employeeNumber: `TEST-${Date.now()}`,
                name: '테스트 직원',
                email: `test-${Date.now()}@example.com`,
                hireDate: new Date(),
                status: EmployeeStatus.Active,
                isInitialPasswordSet: true,
            });
            const savedEmployee = await dataSource.manager.save(Employee, newEmployee);
            testEmployeeId = savedEmployee.id;
        }
    });

    afterAll(async () => {
        await TestSetup.closeTestApp(app);
    });

    describe('POST /file-management/upload', () => {
        it('근태 신청 파일 업로드 성공', () => {
            const fileBuffer = readFileSync(attendanceRequestFilePath);
            return request(app.getHttpServer())
                .post('/file-management/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', fileBuffer, attendanceRequestFileName)
                .field('year', testYear)
                .field('month', testMonth)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('fileId');
                    expect(res.body).toHaveProperty('fileName');
                    testFileIds.push(res.body.fileId);
                });
        });

        it('출입 내역 파일 업로드 성공', () => {
            const fileBuffer = readFileSync(attendanceEventFilePath);
            return request(app.getHttpServer())
                .post('/file-management/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', fileBuffer, attendanceEventFileName)
                .field('year', testYear)
                .field('month', testMonth)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('fileId');
                    expect(res.body).toHaveProperty('fileName');
                    testFileIds.push(res.body.fileId);
                });
        });

        it('파일 없이 요청 시 400 에러', () => {
            return request(app.getHttpServer())
                .post('/file-management/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    year: testYear,
                    month: testMonth,
                })
                .expect(400);
        });

        it('인증 토큰 없이 요청 시 테스트 환경 201 응답', async () => {
            const fileBuffer = readFileSync(attendanceRequestFilePath);
            await request(app.getHttpServer())
                .post('/file-management/upload')
                .attach('file', fileBuffer, attendanceRequestFileName)
                .field('year', testYear)
                .field('month', testMonth)
                .expect(201);
        });
    });

    describe('POST /file-management/reflect', () => {
        it('파일 내용 반영 성공', async () => {
            await request(app.getHttpServer())
                .post('/file-management/reflect')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    fileIds: testFileIds,
                    employeeIds: [testEmployeeId],
                    year: testYear,
                    month: testMonth,
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('reflections');
                    expect(Array.isArray(res.body.reflections)).toBe(true);
                });

            const listResponse = await request(app.getHttpServer())
                .get('/file-management/files')
                .query({
                    year: testYear,
                    month: testMonth,
                })
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const files = listResponse.body.files as Array<{ reflectionHistories: Array<{ id: string }> }>;
            const histories = files.flatMap((file) => file.reflectionHistories || []);
            testReflectionHistoryId = histories[0]?.id || null;
            expect(testReflectionHistoryId).toBeTruthy();
        });

        it('필수 파라미터 누락 시 400 에러', () => {
            return request(app.getHttpServer())
                .post('/file-management/reflect')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    fileIds: ['123e4567-e89b-12d3-a456-426614174000'],
                    // employeeIds, year, month 누락
                })
                .expect(400);
        });
    });

    describe('POST /file-management/restore-from-history', () => {
        it('이력으로 되돌리기 성공', async () => {
            return request(app.getHttpServer())
                .post('/file-management/restore-from-history')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    reflectionHistoryId: testReflectionHistoryId,
                    year: testYear,
                    month: testMonth,
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('reflectionHistoryId');
                });
        });

        it('반영 이력 ID 누락 시 400 에러', () => {
            return request(app.getHttpServer())
                .post('/file-management/restore-from-history')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    year: '2025',
                    month: '11',
                })
                .expect(400);
        });
    });

    describe('GET /file-management/files', () => {
        it('파일 목록과 반영이력 조회 성공', () => {
            return request(app.getHttpServer())
                .get('/file-management/files')
                .query({
                    year: testYear,
                    month: testMonth,
                })
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('files');
                    expect(Array.isArray(res.body.files)).toBe(true);
                });
        });

        it('연도와 월 누락 시 400 에러', () => {
            return request(app.getHttpServer())
                .get('/file-management/files')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });
    });
});
