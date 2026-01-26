import { ICommand } from '@nestjs/cqrs';
import { IDeleteWorkTimeOverrideCommand } from '../../../interfaces/command/delete-work-time-override-command.interface';

/**
 * 특별근태시간 삭제 Command
 */
export class DeleteWorkTimeOverrideCommand implements ICommand {
    constructor(public readonly data: IDeleteWorkTimeOverrideCommand) {}
}
