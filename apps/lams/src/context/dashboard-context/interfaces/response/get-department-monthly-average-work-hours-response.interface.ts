/**
 * 주차별 근무시간 정보
 */
export interface IWeeklyWorkHours {
    weekNumber: number;
    startDate: string;
    endDate: string;
    weeklyWorkHours: number; // 시간 단위
}

/**
 * 직원별 근무시간 정보
 */
export interface IEmployeeWorkHours {
    employeeId: string;
    employeeName: string;
    employeeNumber: string;
    totalWorkHours: number;
    lateCount: number;
    earlyLeaveCount: number;
    weeklyWorkHours: IWeeklyWorkHours[];
}

/**
 * 월별 평균 근무시간 정보
 */
export interface IMonthlyAverageWorkHours {
    month: string;
    averageWorkHours: number;
    employeeWorkHours: IEmployeeWorkHours[];
}

/**
 * 부서별 월별 일평균 근무시간 조회 응답 인터페이스
 */
export interface IGetDepartmentMonthlyAverageWorkHoursResponse {
    departmentId: string;
    year: string;
    monthlyAverages: IMonthlyAverageWorkHours[];
}
