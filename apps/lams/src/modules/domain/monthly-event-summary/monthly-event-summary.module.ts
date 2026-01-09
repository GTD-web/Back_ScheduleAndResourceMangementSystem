import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyEventSummary } from './monthly-event-summary.entity';
import { DomainMonthlyEventSummaryRepository } from './monthly-event-summary.repository';
import { DomainMonthlyEventSummaryService } from './monthly-event-summary.service';
import { DomainAttendanceTypeModule } from '../attendance-type/attendance-type.module';

@Module({
    imports: [TypeOrmModule.forFeature([MonthlyEventSummary]), DomainAttendanceTypeModule],
    providers: [DomainMonthlyEventSummaryRepository, DomainMonthlyEventSummaryService],
    exports: [DomainMonthlyEventSummaryRepository, DomainMonthlyEventSummaryService],
})
export class DomainMonthlyEventSummaryModule {}
