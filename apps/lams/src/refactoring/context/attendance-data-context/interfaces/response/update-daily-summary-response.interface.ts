import { DailyEventSummaryDTO } from '../../../../domain/daily-event-summary/daily-event-summary.types';

/**
 * 일간 요약 수정 응답 인터페이스
 */
export interface IUpdateDailySummaryResponse {
    dailySummary: DailyEventSummaryDTO;
}
