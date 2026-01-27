import { IQuery } from '@nestjs/cqrs';
import { IGetDepartmentSnapshotsQuery } from '../../interfaces';

/**
 * 부서별 연도, 월별 스냅샷 조회 쿼리
 */
export class GetDepartmentSnapshotsQuery implements IQuery {
    constructor(public readonly data: IGetDepartmentSnapshotsQuery) {}
}
