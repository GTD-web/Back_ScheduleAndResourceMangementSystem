import { ICommand } from '@nestjs/cqrs';
import { IDeleteAttendanceTypeCommand } from '../../../interfaces/command/delete-attendance-type-command.interface';

/**
 * 근태유형 삭제 Command
 */
export class DeleteAttendanceTypeCommand implements ICommand {
    constructor(public readonly data: IDeleteAttendanceTypeCommand) {}
}
