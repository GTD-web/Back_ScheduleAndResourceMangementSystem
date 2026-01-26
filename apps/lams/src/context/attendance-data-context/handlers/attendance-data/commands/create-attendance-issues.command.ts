import { ICreateAttendanceIssuesCommand } from '../../../interfaces';

/**
 * 근태 이슈 생성 커맨드
 */
export class CreateAttendanceIssuesCommand {
    constructor(public readonly data: ICreateAttendanceIssuesCommand) {}
}
