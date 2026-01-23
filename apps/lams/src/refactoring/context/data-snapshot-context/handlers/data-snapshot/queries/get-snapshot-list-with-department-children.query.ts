import { IQuery } from '@nestjs/cqrs';
import { IGetSnapshotListWithDepartmentChildrenQuery } from '../../../interfaces/query/get-snapshot-list-with-department-children-query.interface';

/**
 * 부서 기준 스냅샷 목록 조회 Query
 */
export class GetSnapshotListWithDepartmentChildrenQuery implements IQuery {
    constructor(public readonly data: IGetSnapshotListWithDepartmentChildrenQuery) {}
}
