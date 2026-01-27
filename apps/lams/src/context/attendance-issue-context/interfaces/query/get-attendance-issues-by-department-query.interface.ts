/**
 * 연월/부서별 근태 이슈 조회 Query 인터페이스
 */
export interface IGetAttendanceIssuesByDepartmentQuery {
    year: string;
    month: string;
    departmentId: string;
}
