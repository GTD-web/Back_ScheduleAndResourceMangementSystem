/**
 * 프로젝트 관련 타입 정의
 */

/**
 * 프로젝트 생성 데이터
 */
export interface CreateProjectData {
    projectCode: string;
    projectName: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}

/**
 * 프로젝트 업데이트 데이터
 */
export interface UpdateProjectData {
    projectCode?: string;
    projectName?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}

/**
 * 프로젝트 DTO
 */
export interface ProjectDTO {
    id: string;
    projectCode: string;
    projectName: string;
    description: string | null;
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
