import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssignProjectCommand } from './assign-project.command';
import { IAssignProjectResponse } from '../../../interfaces/response/assign-project-response.interface';
import { DomainAssignedProjectService } from '../../../../../domain/assigned-project/assigned-project.service';

/**
 * 프로젝트 할당 Handler
 */
@CommandHandler(AssignProjectCommand)
export class AssignProjectHandler
    implements ICommandHandler<AssignProjectCommand, IAssignProjectResponse>
{
    private readonly logger = new Logger(AssignProjectHandler.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly assignedProjectService: DomainAssignedProjectService,
    ) {}

    async execute(command: AssignProjectCommand): Promise<IAssignProjectResponse> {
        const { employeeId, projectId, startDate, endDate } = command.data;

        this.logger.log(`프로젝트 할당 시작: employeeId=${employeeId}, projectId=${projectId}`);

        return await this.dataSource.transaction(async (manager) => {
            const assignedProject = await this.assignedProjectService.생성한다(
                {
                    employeeId,
                    projectId,
                    startDate,
                    endDate,
                    isActive: true,
                },
                manager,
            );

            this.logger.log(`프로젝트 할당 완료: assignedProjectId=${assignedProject.id}`);

            return {
                assignedProject,
            };
        });
    }
}
