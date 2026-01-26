/**
 * 일일요약 소프트 삭제 커맨드 인터페이스
 */
export interface ISoftDeleteDailySummariesCommand {
    year: string;
    month: string;
    performedBy: string;
}
