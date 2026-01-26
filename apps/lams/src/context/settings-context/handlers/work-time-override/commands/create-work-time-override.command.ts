import { ICommand } from '@nestjs/cqrs';
import { ICreateWorkTimeOverrideCommand } from '../../../interfaces/command/create-work-time-override-command.interface';

/**
 * 특별근태시간 생성 Command
 */
export class CreateWorkTimeOverrideCommand implements ICommand {
    constructor(public readonly data: ICreateWorkTimeOverrideCommand) {}
}
