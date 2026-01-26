import { AttendanceIssueDTO } from '../../../../domain/attendance-issue/attendance-issue.types';

/**
 * 근태 이슈 수정 정보 설정 Response 인터페이스
 */
export interface IUpdateAttendanceIssueCorrectionResponse {
    issue: AttendanceIssueDTO;
}
