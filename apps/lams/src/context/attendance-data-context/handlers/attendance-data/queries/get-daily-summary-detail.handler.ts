import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { GetDailySummaryDetailQuery } from './get-daily-summary-detail.query';
import { IGetDailySummaryDetailResponse } from '../../../interfaces/response/get-daily-summary-detail-response.interface';
import { DomainDailyEventSummaryService } from '../../../../../domain/daily-event-summary/daily-event-summary.service';
import { DomainDailySummaryChangeHistoryService } from '../../../../../domain/daily-summary-change-history/daily-summary-change-history.service';
import { DomainAttendanceIssueService } from '../../../../../domain/attendance-issue/attendance-issue.service';

/**
 * 일간 요약 상세 조회 Query Handler
 *
 * 일간 요약 ID를 기준으로 해당 일간 요약의 상세 정보, 수정이력, 근태 이슈를 조회합니다.
 */
@QueryHandler(GetDailySummaryDetailQuery)
export class GetDailySummaryDetailHandler implements IQueryHandler<
    GetDailySummaryDetailQuery,
    IGetDailySummaryDetailResponse
> {
    private readonly logger = new Logger(GetDailySummaryDetailHandler.name);

    constructor(
        private readonly dailyEventSummaryService: DomainDailyEventSummaryService,
        private readonly dailySummaryChangeHistoryService: DomainDailySummaryChangeHistoryService,
        private readonly attendanceIssueService: DomainAttendanceIssueService,
    ) {}

    async execute(query: GetDailySummaryDetailQuery): Promise<IGetDailySummaryDetailResponse> {
        const { dailySummaryId } = query.data;

        this.logger.log(`일간 요약 상세 조회 시작: dailySummaryId=${dailySummaryId}`);

        // 1. 일간 요약 조회
        const dailySummary = await this.dailyEventSummaryService.ID로조회한다(dailySummaryId);
        if (!dailySummary) {
            throw new NotFoundException(`일간 요약을 찾을 수 없습니다. (id: ${dailySummaryId})`);
        }

        // 2. 수정이력 조회
        const histories = await this.dailySummaryChangeHistoryService.일간요약ID로목록조회한다(dailySummaryId);

        // 3. 근태 이슈 조회
        const issues = await this.attendanceIssueService.일간요약ID로조회한다(dailySummaryId);

        this.logger.log(
            `일간 요약 상세 조회 완료: dailySummaryId=${dailySummaryId}, historyCount=${histories.length}, issueCount=${issues.length}`,
        );

        return {
            dailySummary: {
                ...dailySummary,
                history: histories.length > 0 ? histories : undefined,
                issues: issues.length > 0 ? issues : undefined,
            },
        };
    }
}
