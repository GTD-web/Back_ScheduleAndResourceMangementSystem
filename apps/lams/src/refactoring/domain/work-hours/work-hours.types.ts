/**
 * 시수 DTO
 */
export interface WorkHoursDTO {
    id: string;
    assignedProjectId: string;
    date: string;
    startTime: string | null;
    endTime: string | null;
    workMinutes: number;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}

/**
 * 시수 관련 타입 정의
 */

/**
 * 시수 생성 데이터
 */
export interface CreateWorkHoursData {
    assignedProjectId: string;
    date: string;
    startTime?: string;
    endTime?: string;
    workMinutes?: number;
    note?: string;
}

/**
 * 시수 업데이트 데이터
 */
export interface UpdateWorkHoursData {
    startTime?: string;
    endTime?: string;
    workMinutes?: number;
    note?: string;
}
