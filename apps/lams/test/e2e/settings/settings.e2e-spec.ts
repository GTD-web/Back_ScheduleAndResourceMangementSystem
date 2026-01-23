import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { Employee, EmployeeStatus } from '../../../../../libs/modules/employee/employee.entity';
import { Department, DepartmentType } from '../../../../../libs/modules/department/department.entity';
import { Position } from '../../../../../libs/modules/position/position.entity';
import { EmployeeDepartmentPositionHistory } from '../../../../../libs/modules/employee-department-position-history/employee-department-position-history.entity';
import { TestSetup } from '../utils/test-setup';
import { TestHelpers } from '../utils/test-helpers';
import { TestDataBuilder } from '../utils/test-data-builder';
import * as request from 'supertest';

const toDateString = (date: Date) => date.toISOString().split('T')[0];

describe('SettingsController (e2e)', () => {
    let app: INestApplication;
    let authToken: string;
    let testData: TestDataBuilder;
    let testEmployeeId: string | null = null;
    let testDepartmentId: string | null = null;
    let testHolidayId: string | null = null;
    let testWorkTimeOverrideId: string | null = null;
    let testHolidayDate: string;
    let testWorkTimeOverrideDate: string;

    beforeAll(async () => {
        app = await TestSetup.createTestApp();
        // JwtService를 사용하여 실제 유효한 토큰 생성
        authToken = TestHelpers.createValidJwtToken(app);
        testData = new TestDataBuilder(app);
        const dataSource = app.get<DataSource>(DataSource);

        const employee = await testData.getEmployee();
        const department = await testData.getDepartment();

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

        const position = dataSource.manager.create(Position, {
            id: randomUUID(),
            positionTitle: '테스트 직책',
            positionCode: `TEST_POS_${Date.now()}`,
            level: 1,
            hasManagementAuthority: true,
        });
        const savedPosition = await dataSource.manager.save(Position, position);

        const managerHistory = dataSource.manager.create(EmployeeDepartmentPositionHistory, {
            employeeId: testEmployeeId!,
            departmentId: testDepartmentId!,
            positionId: savedPosition.id,
            isManager: true,
            effectiveStartDate: toDateString(new Date('2025-01-01')),
            effectiveEndDate: null,
            isCurrent: true,
        });
        await dataSource.manager.save(EmployeeDepartmentPositionHistory, managerHistory);

        await dataSource.query('CREATE TABLE IF NOT EXISTS employee (id uuid PRIMARY KEY, terminationdate date)');
        await dataSource.query('ALTER TABLE employee ADD COLUMN IF NOT EXISTS terminationdate date');
        await dataSource.query('INSERT INTO employee (id, terminationdate) VALUES ($1, NULL) ON CONFLICT (id) DO NOTHING', [
            testEmployeeId,
        ]);

        const now = new Date();
        testHolidayDate = toDateString(new Date(now.getTime() + 24 * 60 * 60 * 1000));

        testWorkTimeOverrideDate = '2099-12-30';
        await dataSource.query('DELETE FROM work_time_overrides WHERE date = $1', [testWorkTimeOverrideDate]);

        const holiday = await testData.getHoliday();
        const workTimeOverride = await testData.getWorkTimeOverride();
        testHolidayId = (holiday as any)?.id || null;
        testWorkTimeOverrideId = (workTimeOverride as any)?.id || null;
    });

    afterAll(async () => {
        await TestSetup.closeTestApp(app);
    });

    describe('GET /settings/employees/managers', () => {
        it('관리자 직원 목록 조회 성공', async () => {
            const res = await request(app.getHttpServer())
                .get('/settings/employees/managers')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('employees');
            expect(Array.isArray(res.body.employees)).toBe(true);
        });
    });

    describe('GET /settings/departments', () => {
        it('권한 관리용 부서 목록 조회 성공', () => {
            return request(app.getHttpServer())
                .get('/settings/departments')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('departments');
                    expect(Array.isArray(res.body.departments)).toBe(true);
                });
        });
    });

    describe('PATCH /settings/permissions', () => {
        it('직원-부서 권한 변경 성공', () => {
            return request(app.getHttpServer())
                .patch('/settings/permissions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    employeeId: testEmployeeId,
                    departmentId: testDepartmentId,
                    hasAccessPermission: true,
                    hasReviewPermission: false,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('permission');
                });
        });

        it('필수 파라미터 누락 시 400 에러', () => {
            return request(app.getHttpServer())
                .patch('/settings/permissions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    employeeId: '123e4567-e89b-12d3-a456-426614174000',
                    // departmentId 누락
                })
                .expect(400);
        });
    });

    describe('PATCH /settings/employee-extra-info', () => {
        it('직원 추가 정보 변경 성공', () => {
            return request(app.getHttpServer())
                .patch('/settings/employee-extra-info')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    employeeId: testEmployeeId,
                    isExcludedFromSummary: true,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('extraInfo');
                });
        });
    });

    describe('GET /settings/holidays', () => {
        it('휴일 목록 조회 성공', () => {
            return request(app.getHttpServer())
                .get('/settings/holidays')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('holidays');
                    expect(Array.isArray(res.body.holidays)).toBe(true);
                });
        });
    });

    describe('POST /settings/holidays', () => {
        it('휴일 정보 생성 성공', async () => {
            const res = await request(app.getHttpServer())
                .post('/settings/holidays')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    holidayName: '테스트 휴일',
                    holidayDate: testHolidayDate,
                })
                .expect(201);

            expect(res.body).toHaveProperty('holidayInfo');
            expect(res.body.holidayInfo).toHaveProperty('id');
            testHolidayId = res.body.holidayInfo.id;
        });

        it('필수 파라미터 누락 시 400 에러', () => {
            return request(app.getHttpServer())
                .post('/settings/holidays')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    holidayName: '테스트 휴일',
                    // holidayDate 누락
                })
                .expect(400);
        });
    });

    describe('PATCH /settings/holidays', () => {
        it('휴일 정보 수정 성공', () => {
            return request(app.getHttpServer())
                .patch('/settings/holidays')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    id: testHolidayId,
                    holidayName: '수정된 휴일',
                    holidayDate: testHolidayDate,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('holidayInfo');
                });
        });
    });

    describe('DELETE /settings/holidays', () => {
        it('휴일 정보 삭제 성공', () => {
            return request(app.getHttpServer())
                .delete('/settings/holidays')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    id: testHolidayId,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('success', true);
                });
        });
    });

    describe('GET /settings/work-time-overrides', () => {
        it('특별근태시간 목록 조회 성공', () => {
            return request(app.getHttpServer())
                .get('/settings/work-time-overrides')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('workTimeOverrides');
                    expect(Array.isArray(res.body.workTimeOverrides)).toBe(true);
                });
        });
    });

    describe('POST /settings/work-time-overrides', () => {
        it('특별근태시간 생성 성공', async () => {
            const res = await request(app.getHttpServer())
                .post('/settings/work-time-overrides')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    date: testWorkTimeOverrideDate,
                    startWorkTime: '10:00:00',
                    endWorkTime: '19:00:00',
                    reason: '테스트 사유',
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('workTimeOverride');
            expect(res.body.workTimeOverride).toHaveProperty('id');
            testWorkTimeOverrideId = res.body.workTimeOverride.id;
        });
    });

    describe('PATCH /settings/work-time-overrides', () => {
        it('특별근태시간 수정 성공', () => {
            return request(app.getHttpServer())
                .patch('/settings/work-time-overrides')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    id: testWorkTimeOverrideId,
                    startWorkTime: '10:00:00',
                    endWorkTime: '19:00:00',
                    reason: '수정된 사유',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('workTimeOverride');
                });
        });
    });

    describe('DELETE /settings/work-time-overrides', () => {
        it('특별근태시간 삭제 성공', () => {
            return request(app.getHttpServer())
                .delete('/settings/work-time-overrides')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    id: testWorkTimeOverrideId,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('success', true);
                });
        });
    });
});
