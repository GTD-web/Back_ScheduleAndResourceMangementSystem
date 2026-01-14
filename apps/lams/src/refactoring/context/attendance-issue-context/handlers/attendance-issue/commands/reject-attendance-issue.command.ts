import { ICommand } from '@nestjs/cqrs';
import { IRejectAttendanceIssueCommand } from '../../../interfaces';

/**
 * 근태 이슈 미반영 처리 Command
 */
export class RejectAttendanceIssueCommand implements ICommand {
    constructor(public readonly command: IRejectAttendanceIssueCommand) {}
}
