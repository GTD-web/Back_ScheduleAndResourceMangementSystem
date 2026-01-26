/**
 * 부서 정보
 */
export interface IDepartmentInfoForPermission {
    id: string;
    departmentCode: string;
    departmentName: string;
    type: string;
    order: number;
}

/**
 * 권한 관리용 부서 목록 조회 응답 인터페이스
 */
export interface IGetDepartmentListForPermissionResponse {
    departments: IDepartmentInfoForPermission[];
    totalCount: number;
}
