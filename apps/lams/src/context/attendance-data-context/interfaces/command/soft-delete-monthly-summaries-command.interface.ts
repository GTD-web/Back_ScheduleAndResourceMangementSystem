/**
 * 월간요약 소프트 삭제 커맨드 인터페이스
 */
export interface ISoftDeleteMonthlySummariesCommand {
    year: string;
    month: string;
    performedBy: string;
}
