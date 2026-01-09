import { Injectable } from '@nestjs/common';
import { ProjectMicroserviceAdapter } from './project.adapter';
import { ProjectHierarchyResponseDto } from './dto/project-hierarchy-response.dto';
import { GetProjectsByIdsResponseDto } from './dto/get-projects-by-ids-response.dto';
@Injectable()
export class DomainProjectService {
    constructor(private readonly projectMicroserviceAdapter: ProjectMicroserviceAdapter) {}

    async getProjectHierarchy(flatten?: boolean, authorization?: string): Promise<ProjectHierarchyResponseDto> {
        return await this.projectMicroserviceAdapter.getProjectHierarchy(flatten, authorization);
    }

    async getProjectsByIdsGet(projectIds: string[], authorization?: string): Promise<GetProjectsByIdsResponseDto> {
        return this.projectMicroserviceAdapter.getProjectsByIdsGet(projectIds.join(','), authorization);
    }

    async getProjectsByIdsPost(projectIds: string[], authorization?: string): Promise<GetProjectsByIdsResponseDto> {
        return await this.projectMicroserviceAdapter.getProjectsByIdsPost({ ids: projectIds }, authorization);
    }

    async downloadProjectHierarchy(authorization?: string): Promise<Buffer> {
        return await this.projectMicroserviceAdapter.downloadProjectHierarchy(authorization);
    }
}
