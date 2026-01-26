import { IQuery } from '@nestjs/cqrs';
import { IGetSnapshotListQuery } from '../../../interfaces/query/get-snapshot-list-query.interface';

/**
 * 스냅샷 목록 조회 Query
 */
export class GetSnapshotListQuery implements IQuery {
    constructor(public readonly data: IGetSnapshotListQuery) {}
}
