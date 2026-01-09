/**
 * 파일 관련 타입 정의
 */

/**
 * 파일 상태 열거형
 */
export enum FileStatus {
    UNREAD = 'unread',
    READ = 'read',
    ERROR = 'error',
}

/**
 * 파일 생성 데이터
 */
export interface CreateFileData {
    fileName: string;
    fileOriginalName?: string;
    filePath: string;
    uploadBy: string;
    year?: string;
    month?: string;
    data?: Record<string, any>;
}

/**
 * 파일 업데이트 데이터
 */
export interface UpdateFileData {
    fileName?: string;
    fileOriginalName?: string;
    filePath?: string;
    year?: string;
    month?: string;
    status?: FileStatus;
    error?: string;
    data?: Record<string, any>;
}

/**
 * 파일 DTO
 */
export interface FileDTO {
    id: string;
    fileName: string;
    fileOriginalName: string | null;
    filePath: string;
    year: string | null;
    month: string | null;
    readAt: string | null;
    status: FileStatus;
    error: string | null;
    data: Record<string, any> | null;
    uploadBy: string;
    uploadedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}
