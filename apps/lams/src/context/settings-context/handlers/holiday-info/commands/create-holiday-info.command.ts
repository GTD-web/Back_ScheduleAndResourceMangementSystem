import { ICommand } from '@nestjs/cqrs';
import { ICreateHolidayInfoCommand } from '../../../interfaces/command/create-holiday-info-command.interface';

/**
 * 휴일 정보 생성 Command
 */
export class CreateHolidayInfoCommand implements ICommand {
    constructor(public readonly data: ICreateHolidayInfoCommand) {}
}
