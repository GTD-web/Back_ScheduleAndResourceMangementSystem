/**
 * 월간 요약 생성 응답 인터페이스
 */
export interface IGenerateMonthlySummariesResponse {
    success: boolean;
    statistics: {
        monthlyEventSummaryCount: number;
    };
}
