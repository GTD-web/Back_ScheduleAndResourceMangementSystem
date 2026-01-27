/**
 * 주차별 상위 직원 정보
 */
export interface IWeeklyTopEmployee {
    employeeId: string;
    employeeName: string;
    employeeNumber: string;
    weeklyWorkHours: number;
}

/**
 * 주차별 상위 5명 정보
 */
export interface IWeeklyTopEmployees {
    week: number;
    topEmployees: IWeeklyTopEmployee[];
}

/**
 * 부서별 월별 주차별 주간근무시간 상위 5명 조회 응답 인터페이스
 */
export interface IGetDepartmentWeeklyTopEmployeesResponse {
    departmentId: string;
    year: string;
    month: string;
    weeklyTopEmployees: IWeeklyTopEmployees[];
}
