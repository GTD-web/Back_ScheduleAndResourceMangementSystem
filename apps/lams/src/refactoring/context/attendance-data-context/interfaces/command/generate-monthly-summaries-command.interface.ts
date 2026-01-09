/**
 * 월간 요약 생성 커맨드 인터페이스
 */
export interface IGenerateMonthlySummariesCommand {
    employeeIds: string[];
    year: string;
    month: string;
    performedBy: string;
}
