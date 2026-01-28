import { MonthlyEventSummaryDTO } from '../../../../domain/monthly-event-summary/monthly-event-summary.types';

/**
 * 월간 요약 노트 수정 응답 인터페이스
 */
export interface IUpdateMonthlySummaryNoteResponse {
    monthlySummary: MonthlyEventSummaryDTO;
}
