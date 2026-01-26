import { Injectable, Logger } from '@nestjs/common';
import { AttendanceIssueContextService } from '../../context/attendance-issue-context/attendance-issue-context.service';
import { AttendanceDataContextService } from '../../context/attendance-data-context/attendance-data-context.service';
import {
    IGetAttendanceIssuesQuery,
    IGetAttendanceIssuesResponse,
    IGetAttendanceIssueQuery,
    IGetAttendanceIssueResponse,
    IUpdateAttendanceIssueDescriptionCommand,
    IUpdateAttendanceIssueDescriptionResponse,
    IUpdateAttendanceIssueCorrectionCommand,
    IUpdateAttendanceIssueCorrectionResponse,
    IApplyAttendanceIssueCommand,
    IApplyAttendanceIssueResponse,
    IRejectAttendanceIssueCommand,
    IRejectAttendanceIssueResponse,
} from '../../context/attendance-issue-context/interfaces';
import { AttendanceIssueStatus } from '../../domain/attendance-issue/attendance-issue.types';

/**
 * 근태 이슈 비즈니스 서비스
 *
 * 근태 이슈 관련 비즈니스 로직을 오케스트레이션합니다.
 */
@Injectable()
export class AttendanceIssueBusinessService {
    private readonly logger = new Logger(AttendanceIssueBusinessService.name);

    constructor(
        private readonly attendanceIssueContextService: AttendanceIssueContextService,
        private readonly attendanceDataContextService: AttendanceDataContextService,
    ) {}

    /**
     * 근태 이슈 목록을 조회한다
     */
    async 근태이슈목록을조회한다(params: {
        employeeId?: string;
        startDate?: string;
        endDate?: string;
        status?: AttendanceIssueStatus;
    }): Promise<IGetAttendanceIssuesResponse> {
        this.logger.log(`근태 이슈 목록 조회: ${JSON.stringify(params)}`);
        return await this.attendanceIssueContextService.근태이슈목록을조회한다(params);
    }

    /**
     * 근태 이슈를 조회한다
     */
    async 근태이슈를조회한다(id: string): Promise<IGetAttendanceIssueResponse> {
        this.logger.log(`근태 이슈 조회: id=${id}`);
        return await this.attendanceIssueContextService.근태이슈를조회한다({ id });
    }

    /**
     * 근태 이슈 사유를 수정한다 (직원용)
     */
    async 근태이슈사유를수정한다(
        id: string,
        description: string,
        userId: string,
    ): Promise<IUpdateAttendanceIssueDescriptionResponse> {
        this.logger.log(`근태 이슈 사유 수정: id=${id}`);
        return await this.attendanceIssueContextService.근태이슈사유를수정한다({
            id,
            description,
            userId,
        });
    }

    /**
     * 근태 이슈 수정 정보를 설정한다 (관리자용)
     */
    async 근태이슈수정정보를설정한다(
        id: string,
        data: {
            correctedEnterTime?: string;
            correctedLeaveTime?: string;
            correctedAttendanceTypeIds?: string[];
        },
        userId: string,
    ): Promise<IUpdateAttendanceIssueCorrectionResponse> {
        this.logger.log(`근태 이슈 수정 정보 설정: id=${id}`);
        return await this.attendanceIssueContextService.근태이슈수정정보를설정한다({
            id,
            ...data,
            userId,
        });
    }

    /**
     * 근태 이슈를 반영한다 (관리자용)
     */
    async 근태이슈를반영한다(id: string, confirmedBy: string, userId: string): Promise<IApplyAttendanceIssueResponse> {
        this.logger.log(`근태 이슈 반영: id=${id}`);

        // 1. 이슈 조회 (수정 정보 확인)
        const issueResponse = await this.attendanceIssueContextService.근태이슈를조회한다({ id });
        const issue = issueResponse.issue;

        // 2. 일간 요약 수정 (수정 정보가 있는 경우)
        if (issue.dailyEventSummaryId) {
            await this.attendanceDataContextService.일간요약을수정한다({
                dailySummaryId: issue.dailyEventSummaryId,
                enter: issue.correctedEnterTime || undefined,
                leave: issue.correctedLeaveTime || undefined,
                attendanceTypeIds: issue.correctedAttendanceTypeIds || undefined,
                reason: `근태 이슈 반영: ${issue.description || '사유 없음'}`,
                performedBy: userId,
            });
        }

        // 3. 이슈 상태를 반영으로 변경
        return await this.attendanceIssueContextService.근태이슈를반영한다({
            id,
            confirmedBy,
            userId,
        });
    }

    /**
     * 근태 이슈를 미반영 처리한다 (관리자용)
     */
    async 근태이슈를미반영처리한다(
        id: string,
        rejectionReason: string,
        userId: string,
    ): Promise<IRejectAttendanceIssueResponse> {
        this.logger.log(`근태 이슈 미반영 처리: id=${id}`);
        return await this.attendanceIssueContextService.근태이슈를미반영처리한다({
            id,
            rejectionReason,
            userId,
        });
    }
}
