/**
 * 일간 요약 관련 타입 정의
 */

/**
 * 사용된 근태 유형 정보
 */
export interface UsedAttendanceInfo {
    attendanceTypeId: string;
    title: string;
    workTime?: number;
    isRecognizedWorkTime?: boolean;
    startWorkTime?: string | null;
    endWorkTime?: string | null;
    deductedAnnualLeave?: number;
}

/**
 * 일간 요약 생성 데이터
 */
export interface CreateDailyEventSummaryData {
    date: string;
    employeeId?: string;
    monthlyEventSummaryId?: string;
    isHoliday?: boolean;
    enter?: string;
    leave?: string;
    realEnter?: string;
    realLeave?: string;
    isChecked?: boolean;
    isLate?: boolean;
    isEarlyLeave?: boolean;
    isAbsent?: boolean;
    hasAttendanceConflict?: boolean;
    hasAttendanceOverlap?: boolean;
    workTime?: number;
    note?: string;
    usedAttendances?: UsedAttendanceInfo[];
}

/**
 * 일간 요약 업데이트 데이터
 */
export interface UpdateDailyEventSummaryData {
    monthlyEventSummaryId?: string;
    isHoliday?: boolean;
    enter?: string;
    leave?: string;
    realEnter?: string;
    realLeave?: string;
    isChecked?: boolean;
    isLate?: boolean;
    isEarlyLeave?: boolean;
    isAbsent?: boolean;
    hasAttendanceConflict?: boolean;
    hasAttendanceOverlap?: boolean;
    workTime?: number;
    note?: string;
    usedAttendances?: UsedAttendanceInfo[];
}

/**
 * 일간 요약 DTO
 */
export interface DailyEventSummaryDTO {
    id: string;
    date: string;
    employeeId: string | null;
    monthlyEventSummaryId: string | null;
    isHoliday: boolean;
    enter: string | null;
    leave: string | null;
    realEnter: string | null;
    realLeave: string | null;
    isChecked: boolean;
    isLate: boolean;
    isEarlyLeave: boolean;
    isAbsent: boolean;
    hasAttendanceConflict: boolean;
    hasAttendanceOverlap: boolean;
    workTime: number | null;
    note: string | null;
    usedAttendances: UsedAttendanceInfo[] | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}
