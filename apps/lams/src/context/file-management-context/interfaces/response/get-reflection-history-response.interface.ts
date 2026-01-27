import { FileContentReflectionHistoryDTO } from '../../../../domain/file-content-reflection-history/file-content-reflection-history.types';

/**
 * 반영이력 조회 응답 인터페이스
 */
export interface IGetReflectionHistoryResponse {
    reflectionHistories: FileContentReflectionHistoryDTO[];
}
