import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyEventSummary } from './daily-event-summary.entity';
import { DomainDailyEventSummaryService } from './daily-event-summary.service';

/**
 * 일간 요약 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([DailyEventSummary])],
    providers: [DomainDailyEventSummaryService],
    exports: [DomainDailyEventSummaryService, TypeOrmModule],
})
export class DomainDailyEventSummaryModule {}

