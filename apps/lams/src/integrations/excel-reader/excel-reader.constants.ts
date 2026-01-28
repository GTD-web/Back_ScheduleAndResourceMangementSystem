/**
 * 엑셀 리더 상수
 */

/**
 * 지원하는 엑셀 파일 형식
 */
export const SUPPORTED_EXCEL_FORMATS = ['.xlsx', '.xls', '.csv'] as const;

/**
 * 엑셀 MIME 타입
 */
export const EXCEL_MIME_TYPES = {
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    XLS: 'application/vnd.ms-excel',
    CSV: 'text/csv',
} as const;

/**
 * 기본 워크시트 읽기 옵션
 */
export const DEFAULT_READ_OPTIONS = {
    includeEmpty: true, // 빈 셀 포함 여부
    startRow: 1, // 시작 행 (1부터 시작)
    hasHeader: true, // 첫 행이 헤더인지 여부
} as const;

/**
 * 최대 읽기 가능 행 수 (메모리 보호)
 */
export const MAX_ROWS = 100000;

