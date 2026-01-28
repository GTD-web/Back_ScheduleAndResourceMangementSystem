import { IQuery } from '@nestjs/cqrs';
import { IGetMonthlySummaryNoteQuery } from '../../../interfaces/query/get-monthly-summary-note-query.interface';

/**
 * 월간 요약 노트 조회 Query
 */
export class GetMonthlySummaryNoteQuery implements IQuery {
    constructor(public readonly data: IGetMonthlySummaryNoteQuery) {}
}
