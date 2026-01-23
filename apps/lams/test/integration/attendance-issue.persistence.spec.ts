import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TestSetup } from '../e2e/utils/test-setup';
import { AttendanceIssue } from '../../src/refactoring/domain/attendance-issue/attendance-issue.entity';
import { EmployeeDepartmentPositionHistory } from '@libs/modules/employee-department-position-history/employee-department-position-history.entity';

describe('AttendanceIssue 통합 테스트', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    beforeAll(async () => {
        app = await TestSetup.createTestApp();
        dataSource = app.get(DataSource);
    });

    afterAll(async () => {
        await TestSetup.closeTestApp(app);
    });

    it('근태 이슈를 저장하고 조회한다', async () => {
        const history = await dataSource.manager.findOne(EmployeeDepartmentPositionHistory, {
            where: { isCurrent: true },
            relations: ['employee'],
        });

        const employeeId = history?.employee?.id;
        if (!employeeId) {
            throw new Error('통합 테스트에 사용할 직원 정보를 찾을 수 없습니다.');
        }

        const issue = new AttendanceIssue(employeeId, '2025-11-01');
        const savedIssue = await dataSource.manager.save(AttendanceIssue, issue);

        try {
            const found = await dataSource.manager.findOne(AttendanceIssue, {
                where: { id: (savedIssue as unknown as { id: string }).id },
            });

            expect(found).toBeTruthy();
            expect(found?.employee_id).toBe(employeeId);
        } finally {
            await dataSource.manager.delete(AttendanceIssue, {
                id: (savedIssue as unknown as { id: string }).id,
            });
        }
    });
});
