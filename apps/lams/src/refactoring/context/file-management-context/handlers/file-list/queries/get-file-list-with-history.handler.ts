import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetFileListWithHistoryQuery } from './get-file-list-with-history.query';
import { IGetFileListWithHistoryResponse } from '../../../interfaces/response/get-file-list-with-history-response.interface';
import { DomainFileService } from '../../../../../domain/file/file.service';
import { DomainFileContentReflectionHistoryService } from '../../../../../domain/file-content-reflection-history/file-content-reflection-history.service';

/**
 * 파일 목록과 반영이력 조회 Query Handler
 *
 * 파일 목록을 조회하고 각 파일의 반영이력을 함께 조회합니다.
 */
@QueryHandler(GetFileListWithHistoryQuery)
export class GetFileListWithHistoryHandler implements IQueryHandler<
    GetFileListWithHistoryQuery,
    IGetFileListWithHistoryResponse
> {
    private readonly logger = new Logger(GetFileListWithHistoryHandler.name);

    constructor(
        private readonly fileService: DomainFileService,
        private readonly fileContentReflectionHistoryService: DomainFileContentReflectionHistoryService,
    ) {}

    async execute(query: GetFileListWithHistoryQuery): Promise<IGetFileListWithHistoryResponse> {
        const { year, month } = query.data;

        this.logger.log(`파일 목록과 반영이력 조회 시작: year=${year}, month=${month}`);

        // 1. 파일 목록 조회 (연도와 월 필수)
        const files = await this.fileService.연도월별목록조회한다(year, month);

        // 2. 각 파일의 반영이력 조회
        const filesWithHistory = await Promise.all(
            files.map(async (file) => {
                const reflectionHistories = await this.fileContentReflectionHistoryService.파일ID로목록조회한다(
                    file.id,
                );
                return {
                    ...file,
                    reflectionHistories,
                };
            }),
        );

        this.logger.log(`파일 목록과 반영이력 조회 완료: files=${filesWithHistory.length}건`);

        return {
            files: filesWithHistory,
        };
    }
}
