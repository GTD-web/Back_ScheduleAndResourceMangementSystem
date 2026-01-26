/**
 * 할당된 프로젝트 DTO
 */
export interface AssignedProjectDTO {
    id: string;
    employeeId: string;
    projectId: string;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}

/**
 * 할당된 프로젝트 관련 타입 정의
 */

/**
 * 할당된 프로젝트 생성 데이터
 */
export interface CreateAssignedProjectData {
    employeeId: string;
    projectId: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}

/**
 * 할당된 프로젝트 업데이트 데이터
 */
export interface UpdateAssignedProjectData {
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}
