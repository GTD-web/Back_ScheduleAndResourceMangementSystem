import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { ApplyAttendanceIssueCommand } from './apply-attendance-issue.command';
import { IApplyAttendanceIssueResponse } from '../../../interfaces';
import { AttendanceIssueStatus } from '../../../../../domain/attendance-issue/attendance-issue.types';
import { DomainAttendanceIssueService } from '../../../../../domain/attendance-issue/attendance-issue.service';

/**
 * 근태 이슈 반영 Handler
 */
@CommandHandler(ApplyAttendanceIssueCommand)
export class ApplyAttendanceIssueHandler implements ICommandHandler<
    ApplyAttendanceIssueCommand,
    IApplyAttendanceIssueResponse
> {
    constructor(private readonly attendanceIssueService: DomainAttendanceIssueService) {}

    async execute(command: ApplyAttendanceIssueCommand): Promise<IApplyAttendanceIssueResponse> {
        const { command: cmd } = command;

        const issue = await this.attendanceIssueService.ID로조회한다(cmd.id);

        // 이미 반영된 이슈는 다시 반영 불가
        if (issue.status === AttendanceIssueStatus.APPLIED) {
            throw new BadRequestException('이미 반영된 이슈입니다.');
        }

        // 수정 정보가 설정되어 있는지 확인
        const hasCorrection =
            issue.correctedEnterTime ||
            issue.correctedLeaveTime ||
            (issue.correctedAttendanceTypeIds && issue.correctedAttendanceTypeIds.length > 0);

        if (!hasCorrection) {
            throw new BadRequestException('수정 정보가 설정되지 않았습니다. 먼저 수정 정보를 설정해주세요.');
        }

        // 이슈 상태를 반영으로 변경
        const updatedIssue = await this.attendanceIssueService.반영처리한다(cmd.id, cmd.confirmedBy, cmd.userId);

        return { issue: updatedIssue };
    }
}
