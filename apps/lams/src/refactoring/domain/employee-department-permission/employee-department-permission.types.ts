/**
 * 직원-부서 권한 관련 타입 정의
 */

/**
 * 직원-부서 권한 생성 데이터
 */
export interface CreateEmployeeDepartmentPermissionData {
    employeeId: string;
    departmentId: string;
    hasAccessPermission: boolean;
    hasReviewPermission: boolean;
}

/**
 * 직원-부서 권한 업데이트 데이터
 */
export interface UpdateEmployeeDepartmentPermissionData {
    hasAccessPermission?: boolean;
    hasReviewPermission?: boolean;
}

/**
 * 직원-부서 권한 DTO
 */
export interface EmployeeDepartmentPermissionDTO {
    id: string;
    employeeId: string;
    departmentId: string;
    hasAccessPermission: boolean;
    hasReviewPermission: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}
