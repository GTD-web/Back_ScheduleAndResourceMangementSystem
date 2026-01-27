/**
 * 프로젝트 할당 Command 인터페이스
 */
export interface IAssignProjectCommand {
    employeeId: string;
    projectId: string;
    startDate?: string;
    endDate?: string;
    performedBy: string;
}
