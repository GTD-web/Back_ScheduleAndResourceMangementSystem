import { ICommand } from '@nestjs/cqrs';
import { IUpdateWorkTimeOverrideCommand } from '../../../interfaces/command/update-work-time-override-command.interface';

/**
 * 특별근태시간 수정 Command
 */
export class UpdateWorkTimeOverrideCommand implements ICommand {
    constructor(public readonly data: IUpdateWorkTimeOverrideCommand) {}
}
