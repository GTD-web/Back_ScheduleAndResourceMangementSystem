import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailySummaryChangeHistory } from './daily-summary-change-history.entity';
import { DomainDailySummaryChangeHistoryService } from './daily-summary-change-history.service';

/**
 * 일간 요약 변경 이력 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([DailySummaryChangeHistory])],
    providers: [DomainDailySummaryChangeHistoryService],
    exports: [DomainDailySummaryChangeHistoryService, TypeOrmModule],
})
export class DomainDailySummaryChangeHistoryModule {}
