/**
 * 부서별 연도, 월별 스냅샷 조회 쿼리 인터페이스
 */
export interface IGetDepartmentSnapshotsQuery {
    departmentId: string;
    year: string;
    month: string;
}
