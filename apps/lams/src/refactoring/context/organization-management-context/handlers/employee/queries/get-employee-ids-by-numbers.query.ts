import { Query } from '@nestjs/cqrs';
import { IGetEmployeeIdsByNumbersQuery, IGetEmployeeIdsByNumbersResponse } from '../../../interfaces';

/**
 * 직원 번호 목록으로 직원 ID 목록 조회 Query
 */
export class GetEmployeeIdsByNumbersQuery extends Query<IGetEmployeeIdsByNumbersResponse> {
    constructor(public readonly data: IGetEmployeeIdsByNumbersQuery) {
        super();
    }
}
