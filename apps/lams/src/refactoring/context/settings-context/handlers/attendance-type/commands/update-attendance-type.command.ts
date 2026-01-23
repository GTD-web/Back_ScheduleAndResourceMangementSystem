import { ICommand } from '@nestjs/cqrs';
import { IUpdateAttendanceTypeCommand } from '../../../interfaces/command/update-attendance-type-command.interface';

/**
 * 근태유형 수정 Command
 */
export class UpdateAttendanceTypeCommand implements ICommand {
    constructor(public readonly data: IUpdateAttendanceTypeCommand) {}
}
