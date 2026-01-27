import { ICommand } from '@nestjs/cqrs';
import { IReRequestAttendanceIssueCommand } from '../../../interfaces';

/**
 * 근태 이슈 재요청 Command
 */
export class ReRequestAttendanceIssueCommand implements ICommand {
    constructor(public readonly command: IReRequestAttendanceIssueCommand) {}
}
