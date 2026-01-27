import { DailySummaryChangeHistoryDTO } from '../../../../domain/daily-summary-change-history/daily-summary-change-history.types';

/**
 * 일간 요약 수정이력 조회 Response 인터페이스
 */
export interface IGetDailySummaryHistoryResponse {
    dailyEventSummaryId: string;
    histories: DailySummaryChangeHistoryDTO[];
    total: number;
}
