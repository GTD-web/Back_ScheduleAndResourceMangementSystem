import { FileDTO } from '../../../../domain/file/file.types';

/**
 * 파일 목록 조회용 파일 DTO (data, orgData 컬럼 제외)
 */
export type FileDTOWithoutData = Omit<FileDTO, 'data' | 'orgData'>;

/**
 * 파일 목록 조회 응답 인터페이스
 */
export interface IGetFileListResponse {
    files: FileDTOWithoutData[];
}
