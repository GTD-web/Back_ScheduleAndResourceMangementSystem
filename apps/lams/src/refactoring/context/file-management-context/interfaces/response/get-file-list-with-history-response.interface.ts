import { FileDTO } from '../../../../domain/file/file.types';
import { FileContentReflectionHistoryDTO } from '../../../../domain/file-content-reflection-history/file-content-reflection-history.types';

/**
 * 파일 정보 (반영이력 포함)
 */
export interface IFileWithHistory extends FileDTO {
    reflectionHistories: FileContentReflectionHistoryDTO[];
}

/**
 * 파일 목록과 반영이력 조회 응답 인터페이스
 */
export interface IGetFileListWithHistoryResponse {
    files: IFileWithHistory[];
}
