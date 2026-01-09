/**
 * 월간 요약 관련 타입 정의
 */

/**
 * 월간 요약 생성 데이터
 */
export interface CreateMonthlyEventSummaryData {
    employeeNumber: string;
    employeeId: string;
    employeeName: string;
    yyyymm: string;
    workDaysCount: number;
    totalWorkableTime: number;
    totalWorkTime: number;
    avgWorkTimes: number;
    attendanceTypeCount: Record<string, number>;
    weeklyWorkTimeSummary?: any[];
    dailyEventSummary?: any[];
    lateDetails?: any[];
    absenceDetails?: any[];
    earlyLeaveDetails?: any[];
    note?: string;
    additionalNote?: string;
}

/**
 * 월간 요약 업데이트 데이터
 */
export interface UpdateMonthlyEventSummaryData {
    employeeNumber?: string;
    employeeName?: string;
    workDaysCount?: number;
    totalWorkableTime?: number;
    totalWorkTime?: number;
    avgWorkTimes?: number;
    attendanceTypeCount?: Record<string, number>;
    weeklyWorkTimeSummary?: any[];
    dailyEventSummary?: any[];
    lateDetails?: any[];
    absenceDetails?: any[];
    earlyLeaveDetails?: any[];
    note?: string;
    additionalNote?: string;
}

/**
 * 월간 요약 DTO
 */
export interface MonthlyEventSummaryDTO {
    id: string;
    employeeNumber: string;
    employeeId: string;
    employeeName: string;
    yyyymm: string;
    note: string | null;
    additionalNote: string | null;
    workDaysCount: number;
    totalWorkableTime: number | null;
    totalWorkTime: number;
    avgWorkTimes: number;
    attendanceTypeCount: Record<string, number>;
    dailyEventSummary: any[] | null;
    weeklyWorkTimeSummary: any[] | null;
    lateDetails: any[] | null;
    absenceDetails: any[] | null;
    earlyLeaveDetails: any[] | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}

