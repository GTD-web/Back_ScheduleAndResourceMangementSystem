/**
 * 근태유형 수정 Command 인터페이스
 */
export interface IUpdateAttendanceTypeCommand {
    id: string;
    title?: string;
    workTime?: number;
    isRecognizedWorkTime?: boolean;
    startWorkTime?: string;
    endWorkTime?: string;
    deductedAnnualLeave?: number;
    performedBy: string;
}
