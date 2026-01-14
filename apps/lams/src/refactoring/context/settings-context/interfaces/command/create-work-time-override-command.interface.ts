/**
 * 특별근태시간 생성 Command 인터페이스
 */
export interface ICreateWorkTimeOverrideCommand {
    date: string;
    startWorkTime?: string;
    endWorkTime?: string;
    reason?: string;
    performedBy: string;
}
