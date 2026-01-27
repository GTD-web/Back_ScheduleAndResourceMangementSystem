/**
 * 직원의 부서 권한 정보 인터페이스
 */
export interface IEmployeeDepartmentPermissionInfo {
    departmentId: string;
    departmentName: string;
    hasAccessPermission: boolean;
    hasReviewPermission: boolean;
}

/**
 * 직원 권한 정보 인터페이스
 */
export interface IEmployeeWithPermissions {
    id: string;
    employeeNumber: string;
    employeeName: string;
    permissions: IEmployeeDepartmentPermissionInfo[];
}

/**
 * 부서별 권한 조회 응답 인터페이스
 */
export interface IGetDepartmentPermissionsResponse {
    employees: IEmployeeWithPermissions[];
    totalCount: number;
}
