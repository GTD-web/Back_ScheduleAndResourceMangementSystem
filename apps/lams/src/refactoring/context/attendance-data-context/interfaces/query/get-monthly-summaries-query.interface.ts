/**
 * 월간 요약 조회 Query 인터페이스
 */
export interface IGetMonthlySummariesQuery {
    year: string;
    month: string;
    departmentId: string;
}
