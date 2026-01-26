/**
 * 직원-부서 권한 변경 Command 인터페이스
 */
export interface IUpdateEmployeeDepartmentPermissionCommand {
    employeeId: string;
    departmentId: string;
    hasAccessPermission: boolean;
    hasReviewPermission: boolean;
    performedBy: string;
}
