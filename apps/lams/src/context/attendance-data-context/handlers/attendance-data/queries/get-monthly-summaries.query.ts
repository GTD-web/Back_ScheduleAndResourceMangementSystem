import { IQuery } from '@nestjs/cqrs';
import { IGetMonthlySummariesQuery } from '../../../interfaces/query/get-monthly-summaries-query.interface';

/**
 * 월간 요약 조회 Query
 */
export class GetMonthlySummariesQuery implements IQuery {
    constructor(public readonly data: IGetMonthlySummariesQuery) {}
}
