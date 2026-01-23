/**
 * 근태유형 생성 Command 인터페이스
 */
export interface ICreateAttendanceTypeCommand {
    title: string;
    workTime: number;
    isRecognizedWorkTime: boolean;
    startWorkTime?: string;
    endWorkTime?: string;
    deductedAnnualLeave?: number;
    performedBy: string;
}
