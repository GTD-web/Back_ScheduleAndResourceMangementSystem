/**
 * 부서 권한 정보 인터페이스
 */
export interface IDepartmentPermission {
    departmentId: string;
    hasAccessPermission: boolean;
    hasReviewPermission: boolean;
}

/**
 * 직원-부서 권한 변경 Command 인터페이스
 */
export interface IUpdateEmployeeDepartmentPermissionCommand {
    employeeId: string;
    departments: IDepartmentPermission[];
    performedBy: string;
}
