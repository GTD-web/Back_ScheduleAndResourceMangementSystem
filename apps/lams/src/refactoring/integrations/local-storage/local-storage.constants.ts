/**
 * 로컬 스토리지 상수
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
 * 로컬 저장소 폴더 경로
 */
export const LOCAL_FOLDERS = {
    EXCEL: 'excel-files',
    TEMP: 'temp',
} as const;

/**
 * 파일 URL 만료 시간 (초)
 * 로컬 저장소는 만료 시간이 없지만, 인터페이스 호환성을 위해 정의
 */
export const URL_EXPIRATION = 3600;
