import { MonthlyEventSummaryDTO } from '../../../../domain/monthly-event-summary/monthly-event-summary.types';
import { DailyEventSummaryDTO } from '../../../../domain/daily-event-summary/daily-event-summary.types';
import { DailySummaryChangeHistoryDTO } from '../../../../domain/daily-summary-change-history/daily-summary-change-history.types';
import { AttendanceIssueDTO } from '../../../../domain/attendance-issue/attendance-issue.types';

/**
 * 일간 요약 정보 (수정이력 및 이슈 포함)
 */
export interface IDailyEventSummaryWithHistory extends DailyEventSummaryDTO {
    history?: DailySummaryChangeHistoryDTO[];
    issues?: AttendanceIssueDTO[];
}

/**
 * 월간 요약 정보 (일간 요약 포함)
 */
export interface IMonthlyEventSummaryWithDailySummaries extends MonthlyEventSummaryDTO {
    dailySummaries: IDailyEventSummaryWithHistory[];
}

/**
 * 월간 요약 조회 응답 인터페이스
 */
export interface IGetMonthlySummariesResponse {
    monthlySummaries: IMonthlyEventSummaryWithDailySummaries[];
}
