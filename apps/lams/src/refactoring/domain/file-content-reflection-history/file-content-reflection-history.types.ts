/**
 * 파일 내용 반영 이력 관련 타입 정의
 */

/**
 * 파일 내용 반영 이력 생성 데이터
 */
export interface CreateFileContentReflectionHistoryData {
    fileId: string;
    dataSnapshotInfoId?: string;
    info?: string;
}

/**
 * 파일 내용 반영 이력 업데이트 데이터
 */
export interface UpdateFileContentReflectionHistoryData {
    dataSnapshotInfoId?: string | null;
    info?: string | null;
    reflectedAt?: Date | null;
}

/**
 * 파일 내용 반영 이력 DTO
 */
export interface FileContentReflectionHistoryDTO {
    id: string;
    fileId: string;
    dataSnapshotInfoId: string | null;
    info: string | null;
    createdAt: Date;
    reflectedAt: Date | null;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}

