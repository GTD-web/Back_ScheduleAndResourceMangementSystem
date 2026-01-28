import { IEmployeeWithPermissions } from './employee-department-permission-info.interface';

/**
 * 권한 관련 부서 목록 조회 응답 인터페이스
 */
export interface IGetPermissionRelatedDepartmentListResponse {
    employees: IEmployeeWithPermissions[];
    totalCount: number;
}
