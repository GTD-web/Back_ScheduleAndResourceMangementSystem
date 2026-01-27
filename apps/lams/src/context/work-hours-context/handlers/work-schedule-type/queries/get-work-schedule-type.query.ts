import { IQuery } from '@nestjs/cqrs';
import { IGetWorkScheduleTypeQuery } from '../../../interfaces/query/get-work-schedule-type-query.interface';

/**
 * 근무 유형 조회 Query
 */
export class GetWorkScheduleTypeQuery implements IQuery {
    constructor(public readonly data: IGetWorkScheduleTypeQuery) {}
}
