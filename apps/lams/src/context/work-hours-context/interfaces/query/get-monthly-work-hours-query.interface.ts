/**
 * 월별 시수 현황 조회 Query 인터페이스
 */
export interface IGetMonthlyWorkHoursQuery {
    employeeId: string;
    year: string;
    month: string;
}
