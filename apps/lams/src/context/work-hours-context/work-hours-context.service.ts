import { Injectable } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import {
    IGetWorkScheduleTypeQuery,
    IGetMonthlyWorkHoursQuery,
    IGetProjectListQuery,
    IAssignProjectCommand,
    IRemoveProjectAssignmentCommand,
    ICreateWorkHoursCommand,
    IDeleteWorkHoursByDateCommand,
    IGetWorkScheduleTypeResponse,
    IAssignProjectResponse,
    ICreateWorkHoursResponse,
    IGetMonthlyWorkHoursResponse,
    IGetProjectListResponse,
} from './interfaces';
import { GetWorkScheduleTypeQuery } from './handlers/work-schedule-type/queries/get-work-schedule-type.query';
import { GetMonthlyWorkHoursQuery } from './handlers/monthly-work-hours/queries/get-monthly-work-hours.query';
import { GetProjectListQuery } from './handlers/project/queries/get-project-list.query';
import { AssignProjectCommand } from './handlers/assigned-project/commands/assign-project.command';
import { RemoveProjectAssignmentCommand } from './handlers/assigned-project/commands/remove-project-assignment.command';
import { CreateWorkHoursCommand } from './handlers/work-hours/commands/create-work-hours.command';
import { DeleteWorkHoursByDateCommand } from './handlers/work-hours/commands/delete-work-hours-by-date.command';

/**
 * 시수 관리 Context 서비스
 *
 * 시수 관련 비즈니스 로직을 처리합니다.
 */
@Injectable()
export class WorkHoursContextService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    /**
     * 현재 적용 중인 근무 유형을 조회한다
     */
    async 현재근무유형조회한다(query: IGetWorkScheduleTypeQuery): Promise<IGetWorkScheduleTypeResponse> {
        return await this.queryBus.execute(new GetWorkScheduleTypeQuery(query));
    }

    /**
     * 프로젝트를 할당한다
     */
    async 프로젝트할당한다(command: IAssignProjectCommand): Promise<IAssignProjectResponse> {
        return await this.commandBus.execute(new AssignProjectCommand(command));
    }

    /**
     * 프로젝트 할당을 제거한다
     */
    async 프로젝트할당제거한다(command: IRemoveProjectAssignmentCommand): Promise<void> {
        return await this.commandBus.execute(new RemoveProjectAssignmentCommand(command));
    }

    /**
     * 시수를 입력한다
     */
    async 시수입력한다(command: ICreateWorkHoursCommand): Promise<ICreateWorkHoursResponse> {
        return await this.commandBus.execute(new CreateWorkHoursCommand(command));
    }

    /**
     * 날짜별 시수를 삭제한다
     */
    async 날짜별시수삭제한다(command: IDeleteWorkHoursByDateCommand): Promise<void> {
        return await this.commandBus.execute(new DeleteWorkHoursByDateCommand(command));
    }

    /**
     * 월별 시수 현황을 조회한다
     */
    async 월별시수현황조회한다(query: IGetMonthlyWorkHoursQuery): Promise<IGetMonthlyWorkHoursResponse> {
        return await this.queryBus.execute(new GetMonthlyWorkHoursQuery(query));
    }

    /**
     * 프로젝트 목록을 조회한다
     */
    async 프로젝트목록조회한다(query: IGetProjectListQuery): Promise<IGetProjectListResponse> {
        return await this.queryBus.execute(new GetProjectListQuery(query));
    }
}
