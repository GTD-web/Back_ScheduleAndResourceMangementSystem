/**
 * 부서별 월별 직원별 근무내역 조회 쿼리 인터페이스
 */
export interface IGetDepartmentMonthlyEmployeeAttendanceQuery {
    departmentId: string;
    year: string;
    month: string;
}
