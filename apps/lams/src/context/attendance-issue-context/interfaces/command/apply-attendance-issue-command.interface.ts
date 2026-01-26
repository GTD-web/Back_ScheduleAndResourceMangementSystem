/**
 * 근태 이슈 반영 Command 인터페이스
 */
export interface IApplyAttendanceIssueCommand {
    id: string;
    confirmedBy: string;
    userId: string;
}
