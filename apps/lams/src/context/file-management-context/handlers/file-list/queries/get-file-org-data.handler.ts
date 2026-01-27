import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { GetFileOrgDataQuery } from './get-file-org-data.query';
import { IGetFileOrgDataResponse } from '../../../interfaces/response/get-file-org-data-response.interface';
import { DomainFileService } from '../../../../../domain/file/file.service';

/**
 * 파일 orgData 조회 Query Handler
 *
 * 파일 ID로 해당 파일의 orgData만 조회합니다.
 */
@QueryHandler(GetFileOrgDataQuery)
export class GetFileOrgDataHandler
    implements IQueryHandler<GetFileOrgDataQuery, IGetFileOrgDataResponse>
{
    private readonly logger = new Logger(GetFileOrgDataHandler.name);

    constructor(private readonly fileService: DomainFileService) {}

    async execute(query: GetFileOrgDataQuery): Promise<IGetFileOrgDataResponse> {
        const { fileId } = query.data;

        this.logger.log(`파일 orgData 조회 시작: fileId=${fileId}`);

        // 파일 조회
        const file = await this.fileService.ID로조회한다(fileId);

        if (!file) {
            throw new NotFoundException(`파일을 찾을 수 없습니다. (id: ${fileId})`);
        }

        this.logger.log(`파일 orgData 조회 완료: fileId=${fileId}`);

        return {
            fileId: file.id,
            orgData: file.orgData,
        };
    }
}
