import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TestSetup } from '../e2e/utils/test-setup';
import { WorkTimeOverride } from '../../src/refactoring/domain/work-time-override/work-time-override.entity';

describe('WorkTimeOverride 통합 테스트', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    beforeAll(async () => {
        app = await TestSetup.createTestApp();
        dataSource = app.get(DataSource);
    });

    afterAll(async () => {
        await TestSetup.closeTestApp(app);
    });

    it('특별근태시간을 저장하고 조회한다', async () => {
        const override = new WorkTimeOverride('2099-12-31', '10:00:00', '19:00:00', '통합 테스트');
        const savedOverride = await dataSource.manager.save(WorkTimeOverride, override);

        try {
            const found = await dataSource.manager.findOne(WorkTimeOverride, {
                where: { id: (savedOverride as unknown as { id: string }).id },
            });

            expect(found).toBeTruthy();
            expect(found?.date).toBe('2099-12-31');
            expect(found?.start_work_time).toBe('10:00:00');
        } finally {
            await dataSource.manager.delete(WorkTimeOverride, {
                id: (savedOverride as unknown as { id: string }).id,
            });
        }
    });
});
