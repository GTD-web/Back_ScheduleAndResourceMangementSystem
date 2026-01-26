import { ICommand } from '@nestjs/cqrs';
import { ICreateAttendanceTypeCommand } from '../../../interfaces/command/create-attendance-type-command.interface';

/**
 * 근태유형 생성 Command
 */
export class CreateAttendanceTypeCommand implements ICommand {
    constructor(public readonly data: ICreateAttendanceTypeCommand) {}
}
