import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { RejectAttendanceIssueCommand } from './reject-attendance-issue.command';
import { IRejectAttendanceIssueResponse } from '../../../interfaces';
import { DomainAttendanceIssueService } from '../../../../../domain/attendance-issue/attendance-issue.service';
import { AttendanceIssueStatus } from '../../../../../domain/attendance-issue/attendance-issue.types';

/**
 * 근태 이슈 미반영 처리 Handler
 */
@CommandHandler(RejectAttendanceIssueCommand)
export class RejectAttendanceIssueHandler implements ICommandHandler<
    RejectAttendanceIssueCommand,
    IRejectAttendanceIssueResponse
> {
    constructor(private readonly attendanceIssueService: DomainAttendanceIssueService) {}

    async execute(command: RejectAttendanceIssueCommand): Promise<IRejectAttendanceIssueResponse> {
        const { command: cmd } = command;

        const issue = await this.attendanceIssueService.ID로조회한다(cmd.id);

        // 이미 반영된 이슈는 미반영 처리 불가
        if (issue.status === AttendanceIssueStatus.APPLIED) {
            throw new BadRequestException('이미 반영된 이슈는 미반영 처리할 수 없습니다.');
        }

        const updatedIssue = await this.attendanceIssueService.미반영처리한다(cmd.id, cmd.rejectionReason, cmd.userId);

        return { issue: updatedIssue };
    }
}
