import { Injectable, Logger } from '@nestjs/common';
import { DomainProjectService } from '../../domain/project/project.service';

@Injectable()
export class ProjectContextService {
    private readonly logger = new Logger(ProjectContextService.name);

    constructor(private readonly domainProjectService: DomainProjectService) {}

    async 프로젝트_존재여부를_확인한다(projectId: string): Promise<boolean> {
        const response = await this.domainProjectService.getProjectsByIdsGet([projectId]);
        return response.projects.length > 0;
    }

    async 프로젝트들을_조회한다(): Promise<string[]> {
        const response = await this.domainProjectService.getProjectHierarchy();
        return response.projectHierarchy.map((project) => project.id);
    }
}
