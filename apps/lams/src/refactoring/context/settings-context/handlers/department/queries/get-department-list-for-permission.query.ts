import { IQuery } from '@nestjs/cqrs';
import { IGetDepartmentListForPermissionQuery } from '../../../interfaces/query/get-department-list-for-permission-query.interface';

/**
 * 권한 관리용 부서 목록 조회 Query
 */
export class GetDepartmentListForPermissionQuery implements IQuery {
    constructor(public readonly data: IGetDepartmentListForPermissionQuery) {}
}
