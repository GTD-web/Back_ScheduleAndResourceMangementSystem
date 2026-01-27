import { IQuery } from '@nestjs/cqrs';
import { IGetReflectionHistoryQuery } from '../../../interfaces/query/get-reflection-history-query.interface';

/**
 * 반영이력 조회 Query
 */
export class GetReflectionHistoryQuery implements IQuery {
    constructor(public readonly data: IGetReflectionHistoryQuery) {}
}
