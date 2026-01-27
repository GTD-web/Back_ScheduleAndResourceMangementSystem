/**
 * 직원별 부서 권한 조회 Query 인터페이스
 */
export interface IGetDepartmentPermissionsQuery {
    employeeName?: string;
    departmentName?: string;
}
