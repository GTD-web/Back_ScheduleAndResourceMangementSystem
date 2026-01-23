import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TestSetup } from '../e2e/utils/test-setup';
import { HolidayInfo } from '../../src/refactoring/domain/holiday-info/holiday-info.entity';

describe('HolidayInfo 통합 테스트', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    beforeAll(async () => {
        app = await TestSetup.createTestApp();
        dataSource = app.get(DataSource);
    });

    afterAll(async () => {
        await TestSetup.closeTestApp(app);
    });

    it('휴일 정보를 저장하고 조회한다', async () => {
        const holiday = new HolidayInfo('통합 테스트 휴일', '2099-12-25');
        const savedHoliday = await dataSource.manager.save(HolidayInfo, holiday);

        try {
            const found = await dataSource.manager.findOne(HolidayInfo, {
                where: { id: (savedHoliday as unknown as { id: string }).id },
            });

            expect(found).toBeTruthy();
            expect(found?.holiday_name).toBe('통합 테스트 휴일');
            expect(found?.holiday_date).toBe('2099-12-25');
        } finally {
            await dataSource.manager.delete(HolidayInfo, {
                id: (savedHoliday as unknown as { id: string }).id,
            });
        }
    });
});
