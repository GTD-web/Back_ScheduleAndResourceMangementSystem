import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetReflectionHistoryQuery } from './get-reflection-history.query';
import { IGetReflectionHistoryResponse } from '../../../interfaces/response/get-reflection-history-response.interface';
import { DomainFileContentReflectionHistoryService } from '../../../../../domain/file-content-reflection-history/file-content-reflection-history.service';
import { DomainFileService } from '../../../../../domain/file/file.service';

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
        private readonly fileService: DomainFileService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(query: GetReflectionHistoryQuery): Promise<IGetReflectionHistoryResponse> {
        const { fileId } = query.data;

        this.logger.log(`반영이력 조회 시작: fileId=${fileId}`);

        // 1. 파일 정보 조회 (fileType, year, month 확인)
        const file = await this.fileService.ID로조회한다(fileId);
        if (!file) {
            throw new Error(`파일을 찾을 수 없습니다. (fileId: ${fileId})`);
        }

        return await this.dataSource.transaction(async (manager) => {
            // 2. 같은 연월, 같은 유형의 파일들 중 최신 reflect_at 조회
            const latestReflectedAt = await this.fileContentReflectionHistoryService.같은연월유형최신반영일시조회한다(
                file.fileType,
                file.year,
                file.month,
                manager,
            );

            // 3. 파일 ID로 반영이력 조회
            const reflectionHistories =
                await this.fileContentReflectionHistoryService.파일ID로목록조회한다(fileId);

            // 4. 각 반영이력에 대해 최신 여부 판별
            const reflectionHistoriesWithLatest = reflectionHistories.map((history) => {
                const isLatest =
                    latestReflectedAt !== null &&
                    history.reflectedAt !== null &&
                    history.reflectedAt.getTime() === latestReflectedAt.getTime();

                return {
                    ...history,
                    isLatest,
                };
            });

            this.logger.log(
                `반영이력 조회 완료: histories=${reflectionHistoriesWithLatest.length}건, latestReflectedAt=${latestReflectedAt}`,
            );

            return {
                reflectionHistories: reflectionHistoriesWithLatest,
            };
        });
    }
}
