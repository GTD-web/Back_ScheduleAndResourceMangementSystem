import { IQuery } from '@nestjs/cqrs';
import { IGetPermissionRelatedEmployeeListQuery } from '../../../interfaces/query/get-permission-related-employee-list-query.interface';

/**
 * 권한 관련 직원 목록 조회 Query
 */
export class GetPermissionRelatedEmployeeListQuery implements IQuery {
    constructor(public readonly data: IGetPermissionRelatedEmployeeListQuery) {}
}
