/**
 * 부서별 월별 일평균 근무시간 조회 쿼리 인터페이스
 */
export interface IGetDepartmentMonthlyAverageWorkHoursQuery {
    departmentId: string;
    year: string;
}
