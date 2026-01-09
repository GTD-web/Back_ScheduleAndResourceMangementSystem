import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyEventSummary } from './monthly-event-summary.entity';
import { DomainMonthlyEventSummaryService } from './monthly-event-summary.service';
import { DomainAttendanceTypeModule } from '../attendance-type/attendance-type.module';

/**
 * 월간 요약 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([MonthlyEventSummary]), DomainAttendanceTypeModule],
    providers: [DomainMonthlyEventSummaryService],
    exports: [DomainMonthlyEventSummaryService, TypeOrmModule],
})
export class DomainMonthlyEventSummaryModule {}
