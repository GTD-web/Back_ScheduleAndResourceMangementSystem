import { AssignedProjectDTO } from '../../../../domain/assigned-project/assigned-project.types';

/**
 * 프로젝트 할당 응답 인터페이스
 */
export interface IAssignProjectResponse {
    assignedProject: AssignedProjectDTO;
}
