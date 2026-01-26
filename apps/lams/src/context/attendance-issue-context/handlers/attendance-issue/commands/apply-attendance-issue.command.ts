import { ICommand } from '@nestjs/cqrs';
import { IApplyAttendanceIssueCommand } from '../../../interfaces';

/**
 * 근태 이슈 반영 Command
 */
export class ApplyAttendanceIssueCommand implements ICommand {
    constructor(public readonly command: IApplyAttendanceIssueCommand) {}
}
