import { IQuery } from '@nestjs/cqrs';
import { IGetSnapshotDataFromHistoryQuery } from '../../../interfaces';

/**
 * 스냅샷 데이터 조회 Query
 *
 * 이력 ID를 통해 스냅샷에서 데이터를 조회합니다.
 */
export class GetSnapshotDataFromHistoryQuery implements IQuery {
    constructor(public readonly data: IGetSnapshotDataFromHistoryQuery) {}
}
