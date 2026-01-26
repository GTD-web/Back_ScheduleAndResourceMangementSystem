import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { GetSnapshotByIdQuery } from './get-snapshot-by-id.query';
import { IGetSnapshotByIdResponse } from '../../../interfaces/response/get-snapshot-by-id-response.interface';
import { DomainDataSnapshotInfoService } from '../../../../../domain/data-snapshot-info/data-snapshot-info.service';

/**
 * 스냅샷 ID로 스냅샷과 하위 스냅샷 조회 핸들러
 */
@QueryHandler(GetSnapshotByIdQuery)
export class GetSnapshotByIdHandler implements IQueryHandler<GetSnapshotByIdQuery, IGetSnapshotByIdResponse> {
    private readonly logger = new Logger(GetSnapshotByIdHandler.name);

    constructor(private readonly dataSnapshotInfoService: DomainDataSnapshotInfoService) {}

    async execute(query: GetSnapshotByIdQuery): Promise<IGetSnapshotByIdResponse> {
        const { snapshotId } = query.data;

        this.logger.log(`스냅샷 조회 시작: snapshotId=${snapshotId}`);

        const snapshot = await this.dataSnapshotInfoService.자식포함조회한다(snapshotId);

        if (!snapshot) {
            throw new NotFoundException(`스냅샷을 찾을 수 없습니다. (snapshotId: ${snapshotId})`);
        }

        this.logger.log(`스냅샷 조회 완료: snapshotId=${snapshotId}, children=${snapshot.children?.length || 0}`);

        return {
            snapshot,
        };
    }
}
