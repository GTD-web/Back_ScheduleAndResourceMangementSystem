import { ICommand } from '@nestjs/cqrs';
import { IDeleteWorkHoursByDateCommand } from '../../../interfaces/command/delete-work-hours-by-date-command.interface';

/**
 * 날짜별 시수 삭제 Command
 */
export class DeleteWorkHoursByDateCommand implements ICommand {
    constructor(public readonly data: IDeleteWorkHoursByDateCommand) {}
}
