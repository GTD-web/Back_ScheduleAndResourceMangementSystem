import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainDailyEventSummaryService } from './daily-event-summary.service';
import { DomainDailyEventSummaryRepository } from './daily-event-summary.repository';
import { DailyEventSummary } from './daily-event-summary.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DailyEventSummary])],
    providers: [DomainDailyEventSummaryService, DomainDailyEventSummaryRepository],
    exports: [DomainDailyEventSummaryService],
})
export class DomainDailyEventSummaryModule {}

