import { IQuery } from '@nestjs/cqrs';
import { IGetWageCalculationTypeListQuery } from '../../../interfaces/query/get-wage-calculation-type-list-query.interface';

/**
 * 임금 계산 유형 목록 조회 Query
 */
export class GetWageCalculationTypeListQuery implements IQuery {
    constructor(public readonly data: IGetWageCalculationTypeListQuery) {}
}
