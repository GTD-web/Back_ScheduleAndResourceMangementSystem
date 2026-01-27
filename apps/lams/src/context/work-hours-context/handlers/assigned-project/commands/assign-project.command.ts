import { ICommand } from '@nestjs/cqrs';
import { IAssignProjectCommand } from '../../../interfaces/command/assign-project-command.interface';

/**
 * 프로젝트 할당 Command
 */
export class AssignProjectCommand implements ICommand {
    constructor(public readonly data: IAssignProjectCommand) {}
}
