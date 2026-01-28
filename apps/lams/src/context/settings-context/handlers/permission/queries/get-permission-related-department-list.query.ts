import { IQuery } from '@nestjs/cqrs';
import { IGetPermissionRelatedDepartmentListQuery } from '../../../interfaces/query/get-permission-related-department-list-query.interface';

/**
 * 권한 관련 부서 목록 조회 Query
 */
export class GetPermissionRelatedDepartmentListQuery implements IQuery {
    constructor(public readonly data: IGetPermissionRelatedDepartmentListQuery) {}
}
