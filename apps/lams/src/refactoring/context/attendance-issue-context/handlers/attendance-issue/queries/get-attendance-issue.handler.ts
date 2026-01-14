import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAttendanceIssueQuery } from './get-attendance-issue.query';
import { IGetAttendanceIssueResponse } from '../../../interfaces';
import { DomainAttendanceIssueService } from '../../../../../domain/attendance-issue/attendance-issue.service';

/**
 * 근태 이슈 상세 조회 Handler
 */
@QueryHandler(GetAttendanceIssueQuery)
export class GetAttendanceIssueHandler implements IQueryHandler<GetAttendanceIssueQuery, IGetAttendanceIssueResponse> {
    constructor(private readonly attendanceIssueService: DomainAttendanceIssueService) {}

    async execute(query: GetAttendanceIssueQuery): Promise<IGetAttendanceIssueResponse> {
        const { query: params } = query;
        const issue = await this.attendanceIssueService.ID로조회한다(params.id);
        return { issue };
    }
}
