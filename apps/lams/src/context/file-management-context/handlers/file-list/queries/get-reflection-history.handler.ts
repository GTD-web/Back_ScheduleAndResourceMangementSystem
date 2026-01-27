import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetReflectionHistoryQuery } from './get-reflection-history.query';
import { IGetReflectionHistoryResponse } from '../../../interfaces/response/get-reflection-history-response.interface';
import { DomainFileContentReflectionHistoryService } from '../../../../../domain/file-content-reflection-history/file-content-reflection-history.service';

/**
 * 반영이력 조회 Query Handler
 *
 * 특정 파일의 반영이력만 조회합니다.
 */
@QueryHandler(GetReflectionHistoryQuery)
export class GetReflectionHistoryHandler
    implements IQueryHandler<GetReflectionHistoryQuery, IGetReflectionHistoryResponse>
{
    private readonly logger = new Logger(GetReflectionHistoryHandler.name);

    constructor(
        private readonly fileContentReflectionHistoryService: DomainFileContentReflectionHistoryService,
    ) {}

    async execute(query: GetReflectionHistoryQuery): Promise<IGetReflectionHistoryResponse> {
        const { fileId } = query.data;

        this.logger.log(`반영이력 조회 시작: fileId=${fileId}`);

        // 파일 ID로 반영이력 조회
        const reflectionHistories =
            await this.fileContentReflectionHistoryService.파일ID로목록조회한다(fileId);

        this.logger.log(`반영이력 조회 완료: histories=${reflectionHistories.length}건`);

        return {
            reflectionHistories,
        };
    }
}
