import { DailyEventSummary } from '../../../../domain/daily-event-summary/daily-event-summary.entity';

/**
 * 일일 요약 생성 응답 인터페이스
 */
export interface IGenerateDailySummariesResponse {
    success: boolean;
    statistics: {
        dailyEventSummaryCount: number;
        attendanceIssueCount: number;
    };
    summaries?: DailyEventSummary[]; // 선택적: 오케스트레이션에서 사용
}
