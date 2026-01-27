import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetProjectListQuery } from './get-project-list.query';
import { IGetProjectListResponse } from '../../../interfaces/response/get-project-list-response.interface';
import { DomainProjectService } from '../../../../../domain/project/project.service';

/**
 * 프로젝트 목록 조회 Query Handler
 */
@QueryHandler(GetProjectListQuery)
export class GetProjectListHandler
    implements IQueryHandler<GetProjectListQuery, IGetProjectListResponse>
{
    private readonly logger = new Logger(GetProjectListHandler.name);

    constructor(private readonly projectService: DomainProjectService) {}

    async execute(query: GetProjectListQuery): Promise<IGetProjectListResponse> {
        this.logger.log('프로젝트 목록 조회 시작');

        const projects = await this.projectService.활성화된목록조회한다();

        this.logger.log(`프로젝트 목록 조회 완료: totalCount=${projects.length}`);

        return {
            projects: projects.map((project) => ({
                id: project.id,
                projectCode: project.projectCode,
                projectName: project.projectName,
                description: project.description,
                isActive: project.isActive,
            })),
            totalCount: projects.length,
        };
    }
}
