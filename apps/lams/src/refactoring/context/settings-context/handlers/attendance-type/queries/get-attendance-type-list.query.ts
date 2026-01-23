import { IQuery } from '@nestjs/cqrs';
import { IGetAttendanceTypeListQuery } from '../../../interfaces/query/get-attendance-type-list-query.interface';

/**
 * 근태유형 목록 조회 Query
 */
export class GetAttendanceTypeListQuery implements IQuery {
    constructor(public readonly data: IGetAttendanceTypeListQuery) {}
}
