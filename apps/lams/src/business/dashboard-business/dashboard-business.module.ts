import { Module } from '@nestjs/common';
import { DashboardBusinessService } from './dashboard-business.service';
import { DashboardContextModule } from '../../context/dashboard-context/dashboard-context.module';

/**
 * 대시보드 비즈니스 모듈
 */
@Module({
    imports: [DashboardContextModule],
    providers: [DashboardBusinessService],
    exports: [DashboardBusinessService],
})
export class DashboardBusinessModule {}
