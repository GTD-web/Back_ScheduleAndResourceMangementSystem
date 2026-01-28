import { IEmployeeWithPermissions } from './employee-department-permission-info.interface';

/**
 * 권한 관련 직원 목록 조회 응답 인터페이스
 */
export interface IGetPermissionRelatedEmployeeListResponse {
    employees: IEmployeeWithPermissions[];
    totalCount: number;
}
