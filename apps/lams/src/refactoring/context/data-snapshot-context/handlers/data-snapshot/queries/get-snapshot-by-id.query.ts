import { IQuery } from '@nestjs/cqrs';
import { IGetSnapshotByIdQuery } from '../../../interfaces/query/get-snapshot-by-id-query.interface';

/**
 * 스냅샷 ID로 스냅샷과 하위 스냅샷 조회 Query
 */
export class GetSnapshotByIdQuery implements IQuery {
    constructor(public readonly data: IGetSnapshotByIdQuery) {}
}
