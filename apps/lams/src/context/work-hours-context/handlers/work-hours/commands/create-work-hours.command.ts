import { ICommand } from '@nestjs/cqrs';
import { ICreateWorkHoursCommand } from '../../../interfaces/command/create-work-hours-command.interface';

/**
 * 시수 입력 Command
 */
export class CreateWorkHoursCommand implements ICommand {
    constructor(public readonly data: ICreateWorkHoursCommand) {}
}
