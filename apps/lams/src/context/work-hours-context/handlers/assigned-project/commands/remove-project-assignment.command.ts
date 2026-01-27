import { ICommand } from '@nestjs/cqrs';
import { IRemoveProjectAssignmentCommand } from '../../../interfaces/command/remove-project-assignment-command.interface';

/**
 * 프로젝트 할당 제거 Command
 */
export class RemoveProjectAssignmentCommand implements ICommand {
    constructor(public readonly data: IRemoveProjectAssignmentCommand) {}
}
