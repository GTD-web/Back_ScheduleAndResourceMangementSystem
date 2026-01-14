/**
 * 근태 이슈 수정 정보 설정 Command 인터페이스
 */
export interface IUpdateAttendanceIssueCorrectionCommand {
    id: string;
    correctedEnterTime?: string;
    correctedLeaveTime?: string;
    correctedAttendanceTypeIds?: string[];
    userId: string;
}
