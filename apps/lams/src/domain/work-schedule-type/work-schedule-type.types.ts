/**
 * 근무 유형 관련 타입 정의
 */

/**
 * 근무 유형
 */
export enum ScheduleType {
    FIXED = 'FIXED', // 고정근무
    FLEXIBLE = 'FLEXIBLE', // 유연근무
}

/**
 * 근무 유형 생성 데이터
 */
export interface CreateWorkScheduleTypeData {
    scheduleType: ScheduleType;
    startDate: string; // yyyy-MM-dd 형식
    endDate?: string | null; // yyyy-MM-dd 형식, null이면 현재 적용 중
    reason?: string;
}

/**
 * 근무 유형 업데이트 데이터
 */
export interface UpdateWorkScheduleTypeData {
    scheduleType?: ScheduleType;
    startDate?: string; // yyyy-MM-dd 형식
    endDate?: string | null; // yyyy-MM-dd 형식, null이면 현재 적용 중
    reason?: string;
}

/**
 * 근무 유형 DTO
 */
export interface WorkScheduleTypeDTO {
    id: string;
    scheduleType: ScheduleType;
    startDate: string;
    endDate: string | null;
    reason: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}
