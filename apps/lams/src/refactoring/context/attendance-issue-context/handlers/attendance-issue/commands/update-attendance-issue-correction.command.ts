import { ICommand } from '@nestjs/cqrs';
import { IUpdateAttendanceIssueCorrectionCommand } from '../../../interfaces';

/**
 * 근태 이슈 수정 정보 설정 Command
 */
export class UpdateAttendanceIssueCorrectionCommand implements ICommand {
    constructor(public readonly command: IUpdateAttendanceIssueCorrectionCommand) {}
}
