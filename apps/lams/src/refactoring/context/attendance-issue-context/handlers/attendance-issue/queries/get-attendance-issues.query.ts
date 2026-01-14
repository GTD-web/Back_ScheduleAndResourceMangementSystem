import { IQuery } from '@nestjs/cqrs';
import { IGetAttendanceIssuesQuery, IGetAttendanceIssuesResponse } from '../../../interfaces';

/**
 * 근태 이슈 목록 조회 Query
 */
export class GetAttendanceIssuesQuery implements IQuery {
    constructor(public readonly query: IGetAttendanceIssuesQuery) {}
}
