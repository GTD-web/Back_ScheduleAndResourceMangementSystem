/**
 * 근무시간 커스터마이징 관련 타입 정의
 */

/**
 * 근무시간 커스터마이징 생성 데이터
 */
export interface CreateWorkTimeOverrideData {
    date: string;
    startWorkTime?: string;
    endWorkTime?: string;
    reason?: string;
}

/**
 * 근무시간 커스터마이징 업데이트 데이터
 */
export interface UpdateWorkTimeOverrideData {
    date?: string;
    startWorkTime?: string;
    endWorkTime?: string;
    reason?: string;
}

/**
 * 근무시간 커스터마이징 DTO
 */
export interface WorkTimeOverrideDTO {
    id: string;
    date: string;
    startWorkTime: string | null;
    endWorkTime: string | null;
    reason: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}
