import { IQuery } from '@nestjs/cqrs';
import { IGetDailySummaryHistoryQuery } from '../../../interfaces/query/get-daily-summary-history-query.interface';

/**
 * 일간 요약 수정이력 조회 Query
 */
export class GetDailySummaryHistoryQuery implements IQuery {
    constructor(public readonly data: IGetDailySummaryHistoryQuery) {}
}
