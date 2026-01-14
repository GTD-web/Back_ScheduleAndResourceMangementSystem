import { IQuery } from '@nestjs/cqrs';
import { IGetAttendanceIssueQuery } from '../../../interfaces';

/**
 * 근태 이슈 상세 조회 Query
 */
export class GetAttendanceIssueQuery implements IQuery {
    constructor(public readonly query: IGetAttendanceIssueQuery) {}
}
