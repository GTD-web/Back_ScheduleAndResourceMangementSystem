import { AttendanceIssueDTO } from '../../../../domain/attendance-issue/attendance-issue.types';

/**
 * 근태 이슈 재요청 Response 인터페이스
 */
export interface IReRequestAttendanceIssueResponse {
    issue: AttendanceIssueDTO;
}
