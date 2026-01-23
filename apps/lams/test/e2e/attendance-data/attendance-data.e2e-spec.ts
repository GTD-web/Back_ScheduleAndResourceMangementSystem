import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { Employee, EmployeeStatus } from '../../../../../libs/modules/employee/employee.entity';
import { Department, DepartmentType } from '../../../../../libs/modules/department/department.entity';
import { DataSnapshotInfo } from '../../../src/refactoring/domain/data-snapshot-info/data-snapshot-info.entity';
import { SnapshotType } from '../../../src/refactoring/domain/data-snapshot-info/data-snapshot-info.types';
import { TestSetup } from '../utils/test-setup';
import { TestHelpers } from '../utils/test-helpers';
import { TestDataBuilder } from '../utils/test-data-builder';
import * as request from 'supertest';

describe('AttendanceDataController (e2e)', () => {
    let app: INestApplication;
    let authToken: string;
    let testData: TestDataBuilder;
    let testEmployeeId: string | null = null;
    let testDepartmentId: string | null = null;
    let testDailySummaryId: string | null = null;
    let testSnapshotId: string | null = null;

    beforeAll(async () => {
        app = await TestSetup.createTestApp();
        // JwtService를 사용하여 실제 유효한 토큰 생성
        authToken = TestHelpers.createValidJwtToken(app);
        testData = new TestDataBuilder(app);
        const dataSource = app.get<DataSource>(DataSource);

        // 테스트에 필요한 실제 데이터 조회
        const employee = await testData.getEmployee();
        const department = await testData.getDepartment();
        const dailySummary = await testData.getDailySummary();
        const snapshot = await testData.getSnapshot();

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

        if (department) {
            testDepartmentId = department.id;
        } else {
            const newDepartment = dataSource.manager.create(Department, {
                id: randomUUID(),
                departmentName: '테스트 부서',
                departmentCode: `TEST-${Date.now()}`,
                type: DepartmentType.DEPARTMENT,
                order: 0,
            });
            const savedDepartment = await dataSource.manager.save(Department, newDepartment);
            testDepartmentId = savedDepartment.id;
        }

        await testData.ensureAttendanceType('연차');

        testDailySummaryId = (dailySummary as any)?.id || null;

        // 일간 요약이 없으면 생성
        if (!testDailySummaryId) {
            const today = new Date().toISOString().split('T')[0];
            const created = await testData.createTestDailySummary(today, testEmployeeId!);
            testDailySummaryId = (created as any).id;
        }

        if (snapshot) {
            testSnapshotId = (snapshot as unknown as { id: string }).id;
        } else {
            const snapshotInfo = new DataSnapshotInfo(
                '테스트 스냅샷',
                SnapshotType.MONTHLY,
                '2025',
                '11',
                testDepartmentId!,
                '테스트용 스냅샷',
            );
            const savedSnapshot = await dataSource.manager.save(DataSnapshotInfo, snapshotInfo);
            testSnapshotId = (savedSnapshot as unknown as { id: string }).id;
        }
    });

    afterAll(async () => {
        await TestSetup.closeTestApp(app);
    });

    describe('GET /attendance-data/monthly-summaries', () => {
        it('월간 요약 조회 성공', async () => {
            await request(app.getHttpServer())
                .get('/attendance-data/monthly-summaries')
                .query({
                    year: '2025',
                    month: '11',
                    departmentId: testDepartmentId,
                })
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('monthlySummaries');
                    expect(Array.isArray(res.body.monthlySummaries)).toBe(true);
                });
        });

        it('필수 파라미터 누락 시 400 에러', () => {
            return request(app.getHttpServer())
                .get('/attendance-data/monthly-summaries')
                .query({
                    year: '2025',
                    // month 누락
                })
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });

        it('인증 토큰 없이 요청 시 테스트 환경 200 응답', async () => {
            await request(app.getHttpServer())
                .get('/attendance-data/monthly-summaries')
                .query({
                    year: '2025',
                    month: '11',
                    departmentId: testDepartmentId,
                })
                .expect(200);
        });
    });

    describe('PATCH /attendance-data/daily-summaries/:id', () => {
        it('출퇴근 시간 수정 성공', async () => {
            await request(app.getHttpServer())
                .patch(`/attendance-data/daily-summaries/${testDailySummaryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    enter: '09:00:00',
                    leave: '18:00:00',
                    reason: '테스트 수정',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('dailySummary');
                });
        });

        it('근태유형 수정 성공', async () => {
            const attendanceType = await testData.ensureAttendanceType('연차');

            return request(app.getHttpServer())
                .patch(`/attendance-data/daily-summaries/${testDailySummaryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    attendanceTypeIds: [(attendanceType as any).id],
                    reason: '테스트 수정',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('dailySummary');
                });
        });

        it('출퇴근 시간과 근태유형 동시 수정 시 400 에러', async () => {
            const attendanceType = await testData.ensureAttendanceType('연차');

            return request(app.getHttpServer())
                .patch(`/attendance-data/daily-summaries/${testDailySummaryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    enter: '09:00:00',
                    leave: '18:00:00',
                    attendanceTypeIds: [(attendanceType as any).id],
                })
                .expect(400);
        });

        it('근태유형 3개 이상 설정 시 400 에러', async () => {
            const type1 = await testData.ensureAttendanceType('연차');
            const type2 = await testData.ensureAttendanceType('오전반차');
            const type3 = await testData.ensureAttendanceType('오후반차');

            return request(app.getHttpServer())
                .patch(`/attendance-data/daily-summaries/${testDailySummaryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    attendanceTypeIds: [(type1 as any).id, (type2 as any).id, (type3 as any).id],
                })
                .expect(400);
        });

        it('수정 정보 없이 요청 시 400 에러', async () => {
            await request(app.getHttpServer())
                .patch(`/attendance-data/daily-summaries/${testDailySummaryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);
        });
    });

    describe('POST /attendance-data/snapshots', () => {
        it('근태 스냅샷 저장 성공', async () => {
            const res = await request(app.getHttpServer())
                .post('/attendance-data/snapshots')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    year: '2025',
                    month: '11',
                    departmentId: testDepartmentId,
                    snapshotName: '테스트 스냅샷',
                    description: '테스트용 스냅샷',
                })
                .expect(201);

            expect(res.body).toHaveProperty('snapshot');
            if (res.body.snapshot) {
                expect(res.body.snapshot).toHaveProperty('id');
            } else {
                expect(res.body.snapshot).toBeNull();
            }
        });

        it('필수 파라미터 누락 시 400 에러', () => {
            return request(app.getHttpServer())
                .post('/attendance-data/snapshots')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    year: '2024',
                    // month, departmentId 누락
                })
                .expect(400);
        });
    });

    describe('POST /attendance-data/snapshots/restore', () => {
        it('스냅샷으로부터 복원 성공', async () => {
            return request(app.getHttpServer())
                .post('/attendance-data/snapshots/restore')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    snapshotId: testSnapshotId,
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('snapshotId');
                    expect(res.body).toHaveProperty('restoredCount');
                    expect(typeof res.body.restoredCount.monthlySummaryCount).toBe('number');
                    expect(typeof res.body.restoredCount.dailySummaryCount).toBe('number');
                });
        });

        it('스냅샷 ID 누락 시 400 에러', () => {
            return request(app.getHttpServer())
                .post('/attendance-data/snapshots/restore')
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);
        });
    });

    describe('GET /attendance-data/snapshots', () => {
        it('스냅샷 목록 조회 성공', async () => {
            return request(app.getHttpServer())
                .get('/attendance-data/snapshots')
                .query({
                    year: '2025',
                    month: '11',
                    departmentId: testDepartmentId,
                    sortBy: 'latest',
                })
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('snapshots');
                    expect(Array.isArray(res.body.snapshots)).toBe(true);
                    expect(res.body.snapshots.length).toBeGreaterThan(0);
                });
        });

        it('필수 파라미터 누락 시 400 에러', () => {
            return request(app.getHttpServer())
                .get('/attendance-data/snapshots')
                .query({
                    year: '2025',
                    // month, departmentId 누락
                })
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });
    });
});
