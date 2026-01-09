import { Module } from '@nestjs/common';
import { MonthlySummaryContext } from './monthly-summary.context';
import { DomainMonthlyEventSummaryModule } from '../../domain/monthly-event-summary/monthly-event-summary.module';
import { DomainMonthlyEventSummaryViewModule } from '../../domain/monthly-event-summary-view/monthly-event-summary-view.module';
import { DomainDailyEventSummaryModule } from '../../domain/daily-event-summary/daily-event-summary.module';
import { DomainUsedAttendanceModule } from '../../domain/used-attendance/used-attendance.module';
import { DomainAttendanceTypeModule } from '../../domain/attendance-type/attendance-type.module';

@Module({
    imports: [
        DomainMonthlyEventSummaryModule,
        DomainMonthlyEventSummaryViewModule,
        DomainDailyEventSummaryModule,
        DomainUsedAttendanceModule,
        DomainAttendanceTypeModule,
    ],
    providers: [MonthlySummaryContext],
    exports: [MonthlySummaryContext],
})
export class MonthlySummaryContextModule {}

