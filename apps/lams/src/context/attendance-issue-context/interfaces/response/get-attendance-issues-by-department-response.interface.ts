import { AttendanceIssueDTO } from '../../../../domain/attendance-issue/attendance-issue.types';

/**
 * 직원별 근태 이슈 그룹 인터페이스
 */
export interface IEmployeeIssueGroup {
    employeeId: string;
    employeeName: string;
    employeeNumber: string;
    issues: AttendanceIssueDTO[];
}

/**
 * 연월/부서별 근태 이슈 조회 Response 인터페이스
 */
export interface IGetAttendanceIssuesByDepartmentResponse {
    employeeIssueGroups: IEmployeeIssueGroup[];
    totalIssues: number;
    totalEmployees: number;
}
