import { INestApplication } from '@nestjs/common';
import { TestSetup } from './utils/test-setup';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await TestSetup.createTestApp();
    });

    afterAll(async () => {
        await TestSetup.closeTestApp(app);
    });

    it('애플리케이션이 정상적으로 시작되었는지 확인', () => {
        // 루트 경로가 없으므로 헬스체크 엔드포인트나 다른 엔드포인트로 확인
        // 또는 단순히 앱이 시작되었는지만 확인
        expect(app).toBeDefined();
    });
});
