import { IQuery } from '@nestjs/cqrs';
import { IGetAttendanceIssuesByDepartmentQuery } from '../../../interfaces/query/get-attendance-issues-by-department-query.interface';

/**
 * 연월/부서별 근태 이슈 조회 Query
 */
export class GetAttendanceIssuesByDepartmentQuery implements IQuery {
    constructor(public readonly data: IGetAttendanceIssuesByDepartmentQuery) {}
}
