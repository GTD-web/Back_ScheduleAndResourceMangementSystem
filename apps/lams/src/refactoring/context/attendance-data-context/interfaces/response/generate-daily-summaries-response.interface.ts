/**
 * 일일 요약 생성 응답 인터페이스
 */
export interface IGenerateDailySummariesResponse {
    success: boolean;
    statistics: {
        dailyEventSummaryCount: number;
        attendanceIssueCount: number;
    };
}
