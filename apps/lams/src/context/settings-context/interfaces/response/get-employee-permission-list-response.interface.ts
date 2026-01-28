import { IEmployeeDepartmentPermissionInfo } from './employee-department-permission-info.interface';

/**
 * 직원의 권한 목록 조회 응답 인터페이스
 */
export interface IGetEmployeePermissionListResponse {
    id: string;
    employeeNumber: string;
    employeeName: string;
    permissions: IEmployeeDepartmentPermissionInfo[];
}
