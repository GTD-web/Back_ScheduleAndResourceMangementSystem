import { IQuery } from '@nestjs/cqrs';
import { IGetWorkTimeOverrideListQuery } from '../../../interfaces/query/get-work-time-override-list-query.interface';

/**
 * 특별근태시간 목록 조회 Query
 */
export class GetWorkTimeOverrideListQuery implements IQuery {
    constructor(public readonly data: IGetWorkTimeOverrideListQuery) {}
}
