import { IQuery } from '@nestjs/cqrs';
import { IGetEmployeePermissionListQuery } from '../../../interfaces/query/get-employee-permission-list-query.interface';

/**
 * 직원의 권한 목록 조회 Query
 */
export class GetEmployeePermissionListQuery implements IQuery {
    constructor(public readonly data: IGetEmployeePermissionListQuery) {}
}
