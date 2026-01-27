/**
 * 시수 입력 Command 인터페이스
 */
export interface ICreateWorkHoursCommand {
    assignedProjectId: string;
    date: string;
    startTime?: string;
    endTime?: string;
    workMinutes?: number;
    note?: string;
    performedBy?: string;
}
