import { EmployeeDepartmentPermissionDTO } from '../../../../domain/employee-department-permission/employee-department-permission.types';

/**
 * 직원-부서 권한 변경 응답 인터페이스
 */
export interface IUpdateEmployeeDepartmentPermissionResponse {
    permission: EmployeeDepartmentPermissionDTO;
}
