/**
 * 근태 이슈 미반영 처리 Command 인터페이스
 */
export interface IRejectAttendanceIssueCommand {
    id: string;
    rejectionReason: string;
    userId: string;
}
