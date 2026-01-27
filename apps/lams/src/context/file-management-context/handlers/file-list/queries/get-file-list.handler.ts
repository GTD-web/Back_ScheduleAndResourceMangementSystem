import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetFileListQuery } from './get-file-list.query';
import { IGetFileListResponse, FileDTOWithoutData } from '../../../interfaces/response/get-file-list-response.interface';
import { DomainFileService } from '../../../../../domain/file/file.service';

/**
 * 파일 목록 조회 Query Handler
 *
 * 파일 목록만 조회합니다.
 */
@QueryHandler(GetFileListQuery)
export class GetFileListHandler implements IQueryHandler<GetFileListQuery, IGetFileListResponse> {
    private readonly logger = new Logger(GetFileListHandler.name);

    constructor(private readonly fileService: DomainFileService) {}

    async execute(query: GetFileListQuery): Promise<IGetFileListResponse> {
        const { year, month } = query.data;

        this.logger.log(`파일 목록 조회 시작: year=${year}, month=${month}`);

        // 파일 목록 조회 (연도와 월 필수)
        const files = await this.fileService.연도월별목록조회한다(year, month);

        // data, orgData 컬럼 제거
        const filesWithoutData: FileDTOWithoutData[] = files.map(({ data, orgData, ...file }) => file);

        this.logger.log(`파일 목록 조회 완료: files=${filesWithoutData.length}건`);

        return {
            files: filesWithoutData,
        };
    }
}
