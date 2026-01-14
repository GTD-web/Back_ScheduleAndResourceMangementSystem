import { IQuery } from '@nestjs/cqrs';
import { IGetDepartmentListQuery } from '../../../interfaces/query/get-department-list-query.interface';

/**
 * 부서 목록 조회 Query
 */
export class GetDepartmentListQuery implements IQuery {
    constructor(public readonly data: IGetDepartmentListQuery) {}
}
