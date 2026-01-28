import { IQuery } from '@nestjs/cqrs';
import { IGetDailySummaryDetailQuery } from '../../../interfaces/query/get-daily-summary-detail-query.interface';

/**
 * 일간 요약 상세 조회 Query
 */
export class GetDailySummaryDetailQuery implements IQuery {
    constructor(public readonly data: IGetDailySummaryDetailQuery) {}
}
