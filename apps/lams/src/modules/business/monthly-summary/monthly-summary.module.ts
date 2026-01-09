import { Module } from '@nestjs/common';
import { MonthlySummaryController } from './monthly-summary.controller';
import { MonthlySummaryService } from './monthly-summary.service';
import { MonthlySummaryContextModule } from '../../context/monthly-summary/monthly-summary.context.module';
import { DomainEmployeeDepartmentPositionModule } from '../../domain/employee-department-position/employee-department-position.module';
import { DomainMonthlyEventSummaryModule } from '../../domain/monthly-event-summary/monthly-event-summary.module';

@Module({
    imports: [MonthlySummaryContextModule, DomainEmployeeDepartmentPositionModule, DomainMonthlyEventSummaryModule],
    controllers: [MonthlySummaryController],
    providers: [MonthlySummaryService],
    exports: [MonthlySummaryService],
})
export class MonthlySummaryModule {}
