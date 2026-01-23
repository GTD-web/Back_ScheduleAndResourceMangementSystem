/**
 * 파일 관련 타입 정의
 */

/**
 * 파일 타입
 */
export enum FileType {
    EVENT_HISTORY = 'event_history',
    ATTENDANCE_DATA = 'attendance_data',
}

/**
 * 파일 생성 데이터
 */
export interface CreateFileData {
    fileName: string;
    fileOriginalName?: string;
    fileType?: FileType;    
    filePath: string;
    uploadBy: string;
    year?: string;
    month?: string;
    data?: Record<string, any>;
    orgData?: Record<string, any>;
}

/**
 * 파일 업데이트 데이터
 */
export interface UpdateFileData {
    fileName?: string;
    fileOriginalName?: string;
    fileType?: FileType;
    filePath?: string;
    year?: string;
    month?: string;
    data?: Record<string, any>;
    orgData?: Record<string, any>;
}

/**
 * 파일 DTO
 */
export interface FileDTO {
    id: string;
    fileName: string;
    fileOriginalName: string | null;
    fileType: FileType | null;
    filePath: string;
    year: string | null;
    month: string | null;
    data: Record<string, any> | null;
    orgData: Record<string, any> | null;
    uploadBy: string;
    uploadedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}
