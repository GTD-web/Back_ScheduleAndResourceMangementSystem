import { AttendanceIssueDTO } from '../../../../domain/attendance-issue/attendance-issue.types';

/**
 * 근태 이슈 미반영 처리 Response 인터페이스
 */
export interface IRejectAttendanceIssueResponse {
    issue: AttendanceIssueDTO;
}
