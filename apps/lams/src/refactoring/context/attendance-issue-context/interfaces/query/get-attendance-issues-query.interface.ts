import { AttendanceIssueStatus } from '../../../../domain/attendance-issue/attendance-issue.types';

/**
 * 근태 이슈 목록 조회 Query 인터페이스
 */
export interface IGetAttendanceIssuesQuery {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    status?: AttendanceIssueStatus;
}
