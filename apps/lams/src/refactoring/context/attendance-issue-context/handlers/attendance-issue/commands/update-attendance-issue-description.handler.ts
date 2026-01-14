import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UpdateAttendanceIssueDescriptionCommand } from './update-attendance-issue-description.command';
import { IUpdateAttendanceIssueDescriptionResponse } from '../../../interfaces';
import { DomainAttendanceIssueService } from '../../../../../domain/attendance-issue/attendance-issue.service';
import { AttendanceIssueStatus } from '../../../../../domain/attendance-issue/attendance-issue.types';

/**
 * 근태 이슈 사유 수정 Handler
 */
@CommandHandler(UpdateAttendanceIssueDescriptionCommand)
export class UpdateAttendanceIssueDescriptionHandler implements ICommandHandler<
    UpdateAttendanceIssueDescriptionCommand,
    IUpdateAttendanceIssueDescriptionResponse
> {
    constructor(private readonly attendanceIssueService: DomainAttendanceIssueService) {}

    async execute(
        command: UpdateAttendanceIssueDescriptionCommand,
    ): Promise<IUpdateAttendanceIssueDescriptionResponse> {
        const { command: cmd } = command;

        const issue = await this.attendanceIssueService.ID로조회한다(cmd.id);

        // 이미 반영된 이슈는 수정 불가
        if (issue.status === AttendanceIssueStatus.APPLIED) {
            throw new BadRequestException('이미 반영된 이슈는 수정할 수 없습니다.');
        }

        // 사유 수정 시 상태를 NOT_APPLIED로 변경
        const updatedIssue = await this.attendanceIssueService.수정한다(
            cmd.id,
            {
                description: cmd.description,
                status: AttendanceIssueStatus.NOT_APPLIED,
            },
            cmd.userId,
        );

        return { issue: updatedIssue };
    }
}
