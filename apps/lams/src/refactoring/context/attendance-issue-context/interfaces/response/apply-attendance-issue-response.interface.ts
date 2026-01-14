import { AttendanceIssueDTO } from '../../../../domain/attendance-issue/attendance-issue.types';

/**
 * 근태 이슈 반영 Response 인터페이스
 */
export interface IApplyAttendanceIssueResponse {
    issue: AttendanceIssueDTO;
}
