import { AttendanceIssueDTO } from '../../../../domain/attendance-issue/attendance-issue.types';

/**
 * 근태 이슈 목록 조회 Response 인터페이스
 */
export interface IGetAttendanceIssuesResponse {
    issues: AttendanceIssueDTO[];
    total: number;
}
