import { AttendanceIssueDTO } from '../../../../domain/attendance-issue/attendance-issue.types';

/**
 * 근태 이슈 상세 조회 Response 인터페이스
 */
export interface IGetAttendanceIssueResponse {
    issue: AttendanceIssueDTO;
}
