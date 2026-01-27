/**
 * 프로젝트 할당 제거 Command 인터페이스
 */
export interface IRemoveProjectAssignmentCommand {
    assignedProjectId: string;
    performedBy: string;
}
