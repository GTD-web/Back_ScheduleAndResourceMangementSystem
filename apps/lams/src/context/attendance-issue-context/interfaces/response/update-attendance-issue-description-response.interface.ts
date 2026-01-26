import { AttendanceIssueDTO } from '../../../../domain/attendance-issue/attendance-issue.types';

/**
 * 근태 이슈 사유 수정 Response 인터페이스
 */
export interface IUpdateAttendanceIssueDescriptionResponse {
    issue: AttendanceIssueDTO;
}
