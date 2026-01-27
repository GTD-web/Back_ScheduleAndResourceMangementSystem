/**
 * 부서별 월별 주차별 주간근무시간 상위 5명 조회 쿼리 인터페이스
 */
export interface IGetDepartmentWeeklyTopEmployeesQuery {
    departmentId: string;
    year: string;
    month: string;
}
