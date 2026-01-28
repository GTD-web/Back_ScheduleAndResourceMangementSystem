import { DailyEventSummaryDTO } from '../../../../domain/daily-event-summary/daily-event-summary.types';
import { DailySummaryChangeHistoryDTO } from '../../../../domain/daily-summary-change-history/daily-summary-change-history.types';
import { AttendanceIssueDTO } from '../../../../domain/attendance-issue/attendance-issue.types';

/**
 * 일간 요약 상세 조회 응답 인터페이스
 */
export interface IGetDailySummaryDetailResponse {
    dailySummary: DailyEventSummaryDTO & {
        history?: DailySummaryChangeHistoryDTO[];
        issues?: AttendanceIssueDTO[];
    };
}
