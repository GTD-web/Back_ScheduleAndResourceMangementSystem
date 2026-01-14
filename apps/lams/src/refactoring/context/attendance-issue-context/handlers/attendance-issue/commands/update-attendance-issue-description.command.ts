import { ICommand } from '@nestjs/cqrs';
import { IUpdateAttendanceIssueDescriptionCommand } from '../../../interfaces';

/**
 * 근태 이슈 사유 수정 Command
 */
export class UpdateAttendanceIssueDescriptionCommand implements ICommand {
    constructor(public readonly command: IUpdateAttendanceIssueDescriptionCommand) {}
}
