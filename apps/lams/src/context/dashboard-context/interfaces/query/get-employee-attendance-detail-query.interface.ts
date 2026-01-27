/**
 * 연도, 월별 직원 근태상세 조회 쿼리 인터페이스
 */
export interface IGetEmployeeAttendanceDetailQuery {
    employeeId: string;
    year: string;
    month: string;
}
