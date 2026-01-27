/**
 * 사용된 근태 내역 정보
 */
export interface IUsedAttendance {
    usedAttendanceId: string;
    attendanceTypeId: string;
    title: string;
}

/**
 * 일별 근태 상세 정보
 */
export interface IDailyAttendanceDetail {
    dailyEventSummaryId: string;
    date: string;
    isHoliday: boolean;
    enter: string | null;
    leave: string | null;
    realEnter: string | null;
    realLeave: string | null;
    isChecked: boolean;
    isLate: boolean;
    isEarlyLeave: boolean;
    isAbsent: boolean;
    workTime: number | null;
    note: string | null;
    usedAttendances: IUsedAttendance[];
}

/**
 * 주간 근무시간 요약 정보
 */
export interface IWeeklyWorkTimeSummary {
    weekNumber: number;
    startDate: string;
    endDate: string;
    weeklyWorkTime: number;
}

/**
 * 근태 유형별 카운트
 */
export interface IAttendanceTypeCount {
    title: string;
    count: number;
}

/**
 * 생일 휴가 상세 정보
 */
export interface IBirthDayLeaveDetail {
    usedAt: string;
    leaveType: string;
}

/**
 * 연차 데이터 정보
 */
export interface IAnnualLeaveData {
    totalAnnualLeave: number;
    usedAnnualLeave: number;
    remainingAnnualLeave: number;
    birthDayLeaveDetails: IBirthDayLeaveDetail[];
    createdAt: string;
    updatedAt: string;
    isAdjusted: boolean;
}

/**
 * 월간 근태 통계 정보
 */
export interface IMonthlyAttendanceStatistics {
    monthlyEventSummaryId: string;
    workDaysCount: number;
    totalWorkableTime: number;
    totalWorkTime: number;
    avgWorkTimes: number;
    attendanceTypeCount: IAttendanceTypeCount[];
    weeklyWorkTimeSummary: IWeeklyWorkTimeSummary[];
    annualLeaveData: IAnnualLeaveData | null;
}

/**
 * 연도, 월별 직원 근태상세 조회 응답 인터페이스
 */
export interface IGetEmployeeAttendanceDetailResponse {
    employeeId: string;
    employeeName: string;
    employeeNumber: string;
    yyyymm: string;
    monthlyStatistics: IMonthlyAttendanceStatistics;
    dailyAttendanceDetails: IDailyAttendanceDetail[];
    lateDetails: IDailyAttendanceDetail[];
    absenceDetails: IDailyAttendanceDetail[];
    earlyLeaveDetails: IDailyAttendanceDetail[];
}
