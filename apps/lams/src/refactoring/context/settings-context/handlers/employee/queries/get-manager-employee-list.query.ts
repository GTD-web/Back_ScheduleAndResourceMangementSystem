import { IQuery } from '@nestjs/cqrs';
import { IGetManagerEmployeeListQuery } from '../../../interfaces/query/get-manager-employee-list-query.interface';

/**
 * 관리자 직원 목록 조회 Query
 */
export class GetManagerEmployeeListQuery implements IQuery {
    constructor(public readonly data: IGetManagerEmployeeListQuery) {}
}
