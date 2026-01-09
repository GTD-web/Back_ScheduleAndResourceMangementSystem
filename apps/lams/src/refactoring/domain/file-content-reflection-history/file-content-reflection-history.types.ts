/**
 * 파일 내용 반영 이력 관련 타입 정의
 */

/**
 * 파일 내용 반영 상태
 */
export enum ReflectionStatus {
    PENDING = 'pending', // 대기
    PROCESSING = 'processing', // 처리 중
    COMPLETED = 'completed', // 완료
    FAILED = 'failed', // 실패
}

/**
 * 파일 내용 반영 타입
 */
export enum ReflectionType {
    EVENT_HISTORY = 'event_history', // 출입 이벤트
    ATTENDANCE_DATA = 'attendance_data', // 근태 데이터
    OTHER = 'other', // 기타
}

/**
 * 파일 내용 반영 이력 생성 데이터
 */
export interface CreateFileContentReflectionHistoryData {
    fileId: string;
    type: ReflectionType;
    data?: Record<string, any>;
    status?: ReflectionStatus;
}

/**
 * 파일 내용 반영 이력 업데이트 데이터
 */
export interface UpdateFileContentReflectionHistoryData {
    status?: ReflectionStatus;
    data?: Record<string, any>;
}

/**
 * 파일 내용 반영 이력 DTO
 */
export interface FileContentReflectionHistoryDTO {
    id: string;
    fileId: string;
    status: ReflectionStatus;
    type: ReflectionType;
    data: Record<string, any> | null;
    createdAt: Date;
    reflectedAt: Date | null;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}

