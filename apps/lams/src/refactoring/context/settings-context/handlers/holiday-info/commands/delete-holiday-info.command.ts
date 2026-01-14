import { ICommand } from '@nestjs/cqrs';
import { IDeleteHolidayInfoCommand } from '../../../interfaces/command/delete-holiday-info-command.interface';

/**
 * 휴일 정보 삭제 Command
 */
export class DeleteHolidayInfoCommand implements ICommand {
    constructor(public readonly data: IDeleteHolidayInfoCommand) {}
}
