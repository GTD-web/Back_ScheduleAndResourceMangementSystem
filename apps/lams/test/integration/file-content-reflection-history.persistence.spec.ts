import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TestSetup } from '../e2e/utils/test-setup';
import { File } from '../../src/refactoring/domain/file/file.entity';
import { FileContentReflectionHistory } from '../../src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.entity';
import { ReflectionType } from '../../src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.types';

describe('FileContentReflectionHistory 통합 테스트', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    beforeAll(async () => {
        app = await TestSetup.createTestApp();
        dataSource = app.get(DataSource);
    });

    afterAll(async () => {
        await TestSetup.closeTestApp(app);
    });

    it('반영 이력을 저장하고 조회한다', async () => {
        const file = new File('history.xlsx', '/uploads/history.xlsx', '원본.xlsx', '2025', '11');
        const savedFile = await dataSource.manager.save(File, file);
        const fileId = (savedFile as unknown as { id: string }).id;

        const history = new FileContentReflectionHistory(fileId, ReflectionType.EVENT_HISTORY, { rows: 1 });
        const savedHistory = await dataSource.manager.save(FileContentReflectionHistory, history);

        try {
            const found = await dataSource.manager.findOne(FileContentReflectionHistory, {
                where: { id: (savedHistory as unknown as { id: string }).id },
            });

            expect(found).toBeTruthy();
            expect(found?.file_id).toBe(fileId);
            expect(found?.type).toBe(ReflectionType.EVENT_HISTORY);
        } finally {
            await dataSource.manager.delete(FileContentReflectionHistory, {
                id: (savedHistory as unknown as { id: string }).id,
            });
            await dataSource.manager.delete(File, {
                id: fileId,
            });
        }
    });
});
