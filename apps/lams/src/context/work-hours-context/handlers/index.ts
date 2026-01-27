export * from './work-schedule-type/queries/get-work-schedule-type.handler';
export * from './monthly-work-hours/queries/get-monthly-work-hours.handler';
export * from './project/queries/get-project-list.handler';
export * from './assigned-project/commands/assign-project.handler';
export * from './assigned-project/commands/remove-project-assignment.handler';
export * from './work-hours/commands/create-work-hours.handler';
export * from './work-hours/commands/delete-work-hours-by-date.handler';

import { GetWorkScheduleTypeHandler } from './work-schedule-type/queries/get-work-schedule-type.handler';
import { GetMonthlyWorkHoursHandler } from './monthly-work-hours/queries/get-monthly-work-hours.handler';
import { GetProjectListHandler } from './project/queries/get-project-list.handler';
import { AssignProjectHandler } from './assigned-project/commands/assign-project.handler';
import { RemoveProjectAssignmentHandler } from './assigned-project/commands/remove-project-assignment.handler';
import { CreateWorkHoursHandler } from './work-hours/commands/create-work-hours.handler';
import { DeleteWorkHoursByDateHandler } from './work-hours/commands/delete-work-hours-by-date.handler';

export const QUERY_HANDLERS = [
    GetWorkScheduleTypeHandler,
    GetMonthlyWorkHoursHandler,
    GetProjectListHandler,
];

export const COMMAND_HANDLERS = [
    AssignProjectHandler,
    RemoveProjectAssignmentHandler,
    CreateWorkHoursHandler,
    DeleteWorkHoursByDateHandler,
];
