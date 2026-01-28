import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetMonthlySummaryNoteQuery } from './get-monthly-summary-note.query';
import { IGetMonthlySummaryNoteResponse } from '../../../interfaces/response/get-monthly-summary-note-response.interface';
import { DomainMonthlyEventSummaryService } from '../../../../../domain/monthly-event-summary/monthly-event-summary.service';

/**
 * 월간 요약 노트 조회 Query Handler
 */
@QueryHandler(GetMonthlySummaryNoteQuery)
export class GetMonthlySummaryNoteHandler implements IQueryHandler<
    GetMonthlySummaryNoteQuery,
    IGetMonthlySummaryNoteResponse
> {
    private readonly logger = new Logger(GetMonthlySummaryNoteHandler.name);

    constructor(
        private readonly monthlyEventSummaryService: DomainMonthlyEventSummaryService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(query: GetMonthlySummaryNoteQuery): Promise<IGetMonthlySummaryNoteResponse> {
        const { monthlySummaryId } = query.data;

        this.logger.log(`월간 요약 노트 조회 시작: monthlySummaryId=${monthlySummaryId}`);

        try {
            const monthlySummary = await this.monthlyEventSummaryService.ID로조회한다(monthlySummaryId);

            return {
                id: monthlySummary.id,
                note: monthlySummary.note,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`월간 요약 노트 조회 실패: ${error.message}`, error.stack);
            throw error;
        }
    }
}
