import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TestSetup } from '../e2e/utils/test-setup';
import { DataSnapshotInfo } from '../../src/refactoring/domain/data-snapshot-info/data-snapshot-info.entity';
import { SnapshotType } from '../../src/refactoring/domain/data-snapshot-info/data-snapshot-info.types';
import { Department } from '@libs/modules/department/department.entity';
import { EmployeeDepartmentPositionHistory } from '@libs/modules/employee-department-position-history/employee-department-position-history.entity';

describe('DataSnapshotInfo 통합 테스트', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    beforeAll(async () => {
        app = await TestSetup.createTestApp();
        dataSource = app.get(DataSource);
    });

    afterAll(async () => {
        await TestSetup.closeTestApp(app);
    });

    it('스냅샷 정보를 저장하고 자식 데이터를 조회한다', async () => {
        const departments = await dataSource.manager.find(Department, { take: 1 });
        const department = departments[0];
        if (!department?.id) {
            throw new Error('통합 테스트에 사용할 부서를 찾을 수 없습니다.');
        }

        const history = await dataSource.manager.findOne(EmployeeDepartmentPositionHistory, {
            where: { isCurrent: true },
            relations: ['employee'],
        });
        const employee = history?.employee;
        if (!employee?.id || !employee.employeeNumber) {
            throw new Error('통합 테스트에 사용할 직원 정보를 찾을 수 없습니다.');
        }

        const snapshot = new DataSnapshotInfo(
            '통합 테스트 스냅샷',
            SnapshotType.MONTHLY,
            '2025',
            '11',
            department.id,
            '통합 테스트용',
            'A',
        );

        const child = new DataSnapshotChild(
            employee.id,
            employee.name,
            employee.employeeNumber,
            '2025',
            '11',
            JSON.stringify({ employeeId: employee.id, employeeName: employee.name, employeeNumber: employee.employeeNumber }),
        );
        child.parentSnapshot = snapshot;
        snapshot.dataSnapshotChildInfoList = [child];

        const savedSnapshot = await dataSource.manager.save(DataSnapshotInfo, snapshot);

        try {
            const found = await dataSource.manager.findOne(DataSnapshotInfo, {
                where: { id: (savedSnapshot as unknown as { id: string }).id },
                relations: ['dataSnapshotChildInfoList'],
            });

            expect(found).toBeTruthy();
            expect(found?.snapshot_name).toBe('통합 테스트 스냅샷');
            expect(found?.dataSnapshotChildInfoList?.length).toBe(1);
            expect(found?.dataSnapshotChildInfoList?.[0]?.employee_id).toBe(employee.id);
        } finally {
            await dataSource.manager.delete(DataSnapshotInfo, {
                id: (savedSnapshot as unknown as { id: string }).id,
            });
        }
    });
});
