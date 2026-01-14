import { IQuery } from '@nestjs/cqrs';
import { IGetHolidayListQuery } from '../../../interfaces/query/get-holiday-list-query.interface';

/**
 * 휴일 목록 조회 Query
 */
export class GetHolidayListQuery implements IQuery {
    constructor(public readonly data: IGetHolidayListQuery) {}
}
