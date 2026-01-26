import { ICommand } from '@nestjs/cqrs';
import { IUpdateHolidayInfoCommand } from '../../../interfaces/command/update-holiday-info-command.interface';

/**
 * 휴일 정보 수정 Command
 */
export class UpdateHolidayInfoCommand implements ICommand {
    constructor(public readonly data: IUpdateHolidayInfoCommand) {}
}
