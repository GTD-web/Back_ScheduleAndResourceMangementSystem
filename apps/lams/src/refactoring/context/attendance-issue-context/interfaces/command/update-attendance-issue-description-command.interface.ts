/**
 * 근태 이슈 사유 수정 Command 인터페이스
 */
export interface IUpdateAttendanceIssueDescriptionCommand {
    id: string;
    description: string;
    userId: string;
}
