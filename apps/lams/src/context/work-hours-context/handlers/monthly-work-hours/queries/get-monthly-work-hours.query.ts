import { IQuery } from '@nestjs/cqrs';
import { IGetMonthlyWorkHoursQuery } from '../../../interfaces/query/get-monthly-work-hours-query.interface';

/**
 * 월별 시수 현황 조회 Query
 */
export class GetMonthlyWorkHoursQuery implements IQuery {
    constructor(public readonly data: IGetMonthlyWorkHoursQuery) {}
}
