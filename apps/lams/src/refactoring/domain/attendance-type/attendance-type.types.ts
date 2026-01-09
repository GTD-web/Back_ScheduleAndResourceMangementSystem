/**
 * 출석 타입 DTO
 */
export interface AttendanceTypeDTO {
    id: string;
    title: string;
    workTime: number;
    isRecognizedWorkTime: boolean;
    startWorkTime: string | null;
    endWorkTime: string | null;
    deductedAnnualLeave: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}

/**
 * 출석 타입 관련 타입 정의
 */

/**
 * 출석 타입 생성 데이터
 */
export interface CreateAttendanceTypeData {
    title: string;
    workTime: number;
    isRecognizedWorkTime: boolean;
    startWorkTime?: string;
    endWorkTime?: string;
    deductedAnnualLeave?: number;
}

/**
 * 출석 타입 업데이트 데이터
 */
export interface UpdateAttendanceTypeData {
    title?: string;
    workTime?: number;
    isRecognizedWorkTime?: boolean;
    startWorkTime?: string;
    endWorkTime?: string;
    deductedAnnualLeave?: number;
}
