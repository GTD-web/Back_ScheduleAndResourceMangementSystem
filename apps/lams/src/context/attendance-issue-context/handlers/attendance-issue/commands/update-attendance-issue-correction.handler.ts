import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UpdateAttendanceIssueCorrectionCommand } from './update-attendance-issue-correction.command';
import { IUpdateAttendanceIssueCorrectionResponse } from '../../../interfaces';
import { DomainAttendanceIssueService } from '../../../../../domain/attendance-issue/attendance-issue.service';
import { AttendanceIssueStatus } from '../../../../../domain/attendance-issue/attendance-issue.types';

/**
 * 근태 이슈 수정 정보 설정 Handler
 */
@CommandHandler(UpdateAttendanceIssueCorrectionCommand)
export class UpdateAttendanceIssueCorrectionHandler implements ICommandHandler<
    UpdateAttendanceIssueCorrectionCommand,
    IUpdateAttendanceIssueCorrectionResponse
> {
    constructor(private readonly attendanceIssueService: DomainAttendanceIssueService) {}

    async execute(command: UpdateAttendanceIssueCorrectionCommand): Promise<IUpdateAttendanceIssueCorrectionResponse> {
        const { command: cmd } = command;

        const issue = await this.attendanceIssueService.ID로조회한다(cmd.id);

        // 이미 반영된 이슈는 수정 불가
        if (issue.status === AttendanceIssueStatus.APPLIED) {
            throw new BadRequestException('이미 반영된 이슈는 수정할 수 없습니다.');
        }

        // 출퇴근 시간 수정 또는 근태유형 수정 중 하나만 가능
        const isTimeUpdate = cmd.correctedEnterTime !== undefined || cmd.correctedLeaveTime !== undefined;
        const isAttendanceTypeUpdate = cmd.correctedAttendanceTypeIds !== undefined;

        if (!isTimeUpdate && !isAttendanceTypeUpdate) {
            throw new BadRequestException(
                '출퇴근 시간(correctedEnterTime 또는 correctedLeaveTime) 또는 근태유형(correctedAttendanceTypeIds) 중 하나는 필수입니다.',
            );
        }

        if (isTimeUpdate && isAttendanceTypeUpdate) {
            throw new BadRequestException('출퇴근 시간 수정과 근태유형 수정은 동시에 할 수 없습니다.');
        }

        // 근태유형은 최대 2개까지
        if (isAttendanceTypeUpdate && cmd.correctedAttendanceTypeIds!.length > 2) {
            throw new BadRequestException('근태유형은 최대 2개까지 설정 가능합니다.');
        }

        // 수정 정보 설정 시 상태를 NOT_APPLIED로 변경
        const updatedIssue = await this.attendanceIssueService.수정한다(
            cmd.id,
            {
                correctedEnterTime: cmd.correctedEnterTime,
                correctedLeaveTime: cmd.correctedLeaveTime,
                correctedAttendanceTypeIds: cmd.correctedAttendanceTypeIds,
                status: AttendanceIssueStatus.NOT_APPLIED,
            },
            cmd.userId,
        );

        return { issue: updatedIssue };
    }
}
