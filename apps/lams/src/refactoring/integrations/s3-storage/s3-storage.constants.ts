/**
 * S3 스토리지 상수
 */

/**
 * 지원하는 엑셀 파일 MIME 타입
 */
export const EXCEL_MIME_TYPES = {
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    XLS: 'application/vnd.ms-excel',
    CSV: 'text/csv',
} as const;

/**
 * 엑셀 파일 확장자
 */
export const EXCEL_EXTENSIONS = ['.xlsx', '.xls', '.csv'] as const;

/**
 * 파일 크기 제한 (바이트 단위)
 * 기본값: 10MB
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * S3 버킷 폴더 경로
 */
export const S3_FOLDERS = {
    EXCEL: 'excel-files',
    TEMP: 'temp',
} as const;

/**
 * Presigned URL 만료 시간 (초)
 * 기본값: 1시간
 */
export const PRESIGNED_URL_EXPIRATION = 3600;
