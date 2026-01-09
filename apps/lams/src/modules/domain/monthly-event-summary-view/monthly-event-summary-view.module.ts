import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyEventSummaryView } from './monthly-event-summary-view.entity';
import { DomainMonthlyEventSummaryViewRepository } from './monthly-event-summary-view.repository';
import { DomainMonthlyEventSummaryViewService } from './monthly-event-summary-view.service';

@Module({
    imports: [TypeOrmModule.forFeature([MonthlyEventSummaryView])],
    providers: [DomainMonthlyEventSummaryViewRepository, DomainMonthlyEventSummaryViewService],
    exports: [DomainMonthlyEventSummaryViewRepository, DomainMonthlyEventSummaryViewService],
})
export class DomainMonthlyEventSummaryViewModule {}

