/**
 * 사용된 근태 관련 타입 정의
 */

/**
 * 사용된 근태 생성 데이터
 */
export interface CreateUsedAttendanceData {
    usedAt: string;
    employeeId: string;
    attendanceTypeId: string;
}

/**
 * 사용된 근태 업데이트 데이터
 */
export interface UpdateUsedAttendanceData {
    usedAt?: string;
    attendanceTypeId?: string;
}

/**
 * 사용된 근태 DTO
 */
export interface UsedAttendanceDTO {
    id: string;
    usedAt: string;
    employeeId: string;
    attendanceTypeId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}

