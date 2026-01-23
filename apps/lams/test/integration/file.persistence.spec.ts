import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TestSetup } from '../e2e/utils/test-setup';
import { File } from '../../src/refactoring/domain/file/file.entity';

describe('File 통합 테스트', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    beforeAll(async () => {
        app = await TestSetup.createTestApp();
        dataSource = app.get(DataSource);
    });

    afterAll(async () => {
        await TestSetup.closeTestApp(app);
    });

    it('파일을 저장하고 조회한다', async () => {
        const file = new File('integration.xlsx', '/uploads/integration.xlsx', '원본.xlsx', '2025', '11');
        const savedFile = await dataSource.manager.save(File, file);

        try {
            const found = await dataSource.manager.findOne(File, {
                where: { id: (savedFile as unknown as { id: string }).id },
            });

            expect(found).toBeTruthy();
            expect(found?.file_name).toBe('integration.xlsx');
            expect(found?.file_path).toBe('/uploads/integration.xlsx');
        } finally {
            await dataSource.manager.delete(File, {
                id: (savedFile as unknown as { id: string }).id,
            });
        }
    });
});
