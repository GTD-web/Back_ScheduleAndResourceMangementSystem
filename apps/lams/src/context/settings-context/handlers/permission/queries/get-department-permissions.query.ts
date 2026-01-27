import { IQuery } from '@nestjs/cqrs';
import { IGetDepartmentPermissionsQuery } from '../../../interfaces/query/get-department-permissions-query.interface';

/**
 * 부서별 권한 조회 Query
 */
export class GetDepartmentPermissionsQuery implements IQuery {
    constructor(public readonly data: IGetDepartmentPermissionsQuery) {}
}
