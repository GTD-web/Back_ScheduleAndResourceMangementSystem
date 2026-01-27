import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { GetDailySummaryHistoryQuery } from './get-daily-summary-history.query';
import { IGetDailySummaryHistoryResponse } from '../../../interfaces/response/get-daily-summary-history-response.interface';
import { DomainDailyEventSummaryService } from '../../../../../domain/daily-event-summary/daily-event-summary.service';
import { DomainDailySummaryChangeHistoryService } from '../../../../../domain/daily-summary-change-history/daily-summary-change-history.service';

/**
 * 일간 요약 수정이력 조회 Query Handler
 */
@QueryHandler(GetDailySummaryHistoryQuery)
export class GetDailySummaryHistoryHandler implements IQueryHandler<
    GetDailySummaryHistoryQuery,
    IGetDailySummaryHistoryResponse
> {
    private readonly logger = new Logger(GetDailySummaryHistoryHandler.name);

    constructor(
        private readonly dailyEventSummaryService: DomainDailyEventSummaryService,
        private readonly dailySummaryChangeHistoryService: DomainDailySummaryChangeHistoryService,
    ) {}

    async execute(query: GetDailySummaryHistoryQuery): Promise<IGetDailySummaryHistoryResponse> {
        const { dailyEventSummaryId } = query.data;

        this.logger.log(`일간 요약 수정이력 조회 시작: dailyEventSummaryId=${dailyEventSummaryId}`);

        // 1. 일간 요약 존재 여부 확인
        try {
            await this.dailyEventSummaryService.ID로조회한다(dailyEventSummaryId);
        } catch (error) {
            throw new NotFoundException(`일간 요약을 찾을 수 없습니다. (id: ${dailyEventSummaryId})`);
        }

        // 2. 수정이력 조회
        const histories = await this.dailySummaryChangeHistoryService.일간요약ID로목록조회한다(dailyEventSummaryId);

        this.logger.log(`일간 요약 수정이력 조회 완료: dailyEventSummaryId=${dailyEventSummaryId}, count=${histories.length}`);

        return {
            dailyEventSummaryId,
            histories,
            total: histories.length,
        };
    }
}
