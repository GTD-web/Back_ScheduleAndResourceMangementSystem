import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { Employee, EmployeeStatus } from '../../../../../libs/modules/employee/employee.entity';
import { AttendanceIssue } from '../../../src/refactoring/domain/attendance-issue/attendance-issue.entity';
import { AttendanceIssueStatus } from '../../../src/refactoring/domain/attendance-issue/attendance-issue.types';
import { TestSetup } from '../utils/test-setup';
import { TestHelpers } from '../utils/test-helpers';
import { TestDataBuilder } from '../utils/test-data-builder';
import * as request from 'supertest';

describe('AttendanceIssueController (e2e)', () => {
    let app: INestApplication;
    let authToken: string;
    let testData: TestDataBuilder;
    let testIssueId: string | null = null;
    let testEmployeeId: string | null = null;
    let testApplyIssueId: string | null = null;
    let testApplyNoConfirmedIssueId: string | null = null;

    beforeAll(async () => {
        app = await TestSetup.createTestApp();
        // JwtService를 사용하여 실제 유효한 토큰 생성
        authToken = TestHelpers.createValidJwtToken(app);
        testData = new TestDataBuilder(app);
        const dataSource = app.get<DataSource>(DataSource);

        // 테스트에 필요한 실제 데이터 조회
        const issue = await testData.getAttendanceIssue();
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

        const dailySummary = await testData.getDailySummary();
        const dailySummaryId = dailySummary ? (dailySummary as unknown as { id: string }).id : null;
        if (!dailySummaryId) {
            const today = new Date().toISOString().split('T')[0];
            await testData.createTestDailySummary(today, testEmployeeId!);
        }

        if (issue) {
            testIssueId = (issue as unknown as { id: string }).id;
        } else {
            const today = new Date().toISOString().split('T')[0];
            const createdIssue = new AttendanceIssue(testEmployeeId!, today, dailySummaryId || undefined);
            createdIssue.업데이트한다(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                AttendanceIssueStatus.NOT_APPLIED,
            );
            const savedIssue = await dataSource.manager.save(AttendanceIssue, createdIssue);
            testIssueId = (savedIssue as unknown as { id: string }).id;
        }

        const applyIssueDate = new Date().toISOString().split('T')[0];
        const applyIssue = new AttendanceIssue(testEmployeeId!, applyIssueDate, dailySummaryId || undefined);
        applyIssue.업데이트한다(undefined, undefined, '09:00:00', '18:00:00');
        const savedApplyIssue = await dataSource.manager.save(AttendanceIssue, applyIssue);
        testApplyIssueId = (savedApplyIssue as unknown as { id: string }).id;

        const applyNoConfirmedIssue = new AttendanceIssue(testEmployeeId!, applyIssueDate, dailySummaryId || undefined);
        applyNoConfirmedIssue.업데이트한다(undefined, undefined, '09:00:00', '18:00:00');
        const savedApplyNoConfirmedIssue = await dataSource.manager.save(AttendanceIssue, applyNoConfirmedIssue);
        testApplyNoConfirmedIssueId = (savedApplyNoConfirmedIssue as unknown as { id: string }).id;
    });

    afterAll(async () => {
        await TestSetup.closeTestApp(app);
    });

    describe('GET /attendance-issues', () => {
        it('근태 이슈 목록 조회 성공 (파라미터 없음)', () => {
            return request(app.getHttpServer())
                .get('/attendance-issues')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('issues');
                    expect(Array.isArray(res.body.issues)).toBe(true);
                });
        });

        it('근태 이슈 목록 조회 성공 (필터링)', async () => {
            await request(app.getHttpServer())
                .get('/attendance-issues')
                .query({
                    employeeId: testEmployeeId,
                    startDate: '2025-11-01',
                    endDate: '2025-11-30',
                    status: 'not_applied',
                })
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('issues');
                });
        });

        it('인증 토큰 없이 요청 시 테스트 환경 200 응답', async () => {
            await request(app.getHttpServer()).get('/attendance-issues').expect(200);
        });
    });

    describe('GET /attendance-issues/:id', () => {
        it('근태 이슈 상세 조회 성공', async () => {
            await request(app.getHttpServer())
                .get(`/attendance-issues/${testIssueId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body).toHaveProperty('date');
                });
        });

        it('잘못된 UUID 형식 시 400 에러', () => {
            return request(app.getHttpServer())
                .get('/attendance-issues/invalid-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });
    });

    describe('PATCH /attendance-issues/:id/description', () => {
        it('근태 이슈 사유 수정 성공', async () => {
            await request(app.getHttpServer())
                .patch(`/attendance-issues/${testIssueId}/description`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    description: '테스트 사유',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body).toHaveProperty('description', '테스트 사유');
                });
        });

        it('사유 누락 시 400 에러', async () => {
            await request(app.getHttpServer())
                .patch(`/attendance-issues/${testIssueId}/description`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);
        });
    });

    describe('PATCH /attendance-issues/:id/correction', () => {
        it('출퇴근 시간 수정 정보 설정 성공', async () => {
            await request(app.getHttpServer())
                .patch(`/attendance-issues/${testIssueId}/correction`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    correctedEnterTime: '09:00:00',
                    correctedLeaveTime: '18:00:00',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                });
        });

        it('근태유형 수정 정보 설정 성공', async () => {
            const attendanceType = await testData.ensureAttendanceType('연차');

            return request(app.getHttpServer())
                .patch(`/attendance-issues/${testIssueId}/correction`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    correctedAttendanceTypeIds: [(attendanceType as any).id],
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                });
        });

        it('출퇴근 시간과 근태유형 동시 설정 시 400 에러', async () => {
            const attendanceType = await testData.ensureAttendanceType('연차');

            return request(app.getHttpServer())
                .patch(`/attendance-issues/${testIssueId}/correction`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    correctedEnterTime: '09:00:00',
                    correctedLeaveTime: '18:00:00',
                    correctedAttendanceTypeIds: [(attendanceType as any).id],
                })
                .expect(400);
        });

        it('수정 정보 없이 요청 시 400 에러', async () => {
            await request(app.getHttpServer())
                .patch(`/attendance-issues/${testIssueId}/correction`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);
        });
    });

    describe('PATCH /attendance-issues/:id/apply', () => {
        it('근태 이슈 반영 성공', async () => {
            await request(app.getHttpServer())
                .patch(`/attendance-issues/${testApplyIssueId}/apply`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    confirmedBy: '관리자',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body).toHaveProperty('status', AttendanceIssueStatus.APPLIED);
                });
        });

        it('confirmedBy 없이 요청 시 기본값 사용', async () => {
            await request(app.getHttpServer())
                .patch(`/attendance-issues/${testApplyNoConfirmedIssueId}/apply`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(200);
        });
    });
});
