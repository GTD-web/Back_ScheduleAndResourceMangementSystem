import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardBusinessModule } from '../../business/dashboard-business/dashboard-business.module';

/**
 * 대시보드 인터페이스 모듈
 *
 * 대시보드 관련 API 엔드포인트를 제공합니다.
 */
@Module({
    imports: [DashboardBusinessModule],
    controllers: [DashboardController],
    providers: [],
    exports: [],
})
export class DashboardInterfaceModule {}
