/**
 * 특별근태시간 수정 Command 인터페이스
 */
export interface IUpdateWorkTimeOverrideCommand {
    id: string;
    date?: string;
    startWorkTime?: string;
    endWorkTime?: string;
    reason?: string;
    performedBy: string;
}
