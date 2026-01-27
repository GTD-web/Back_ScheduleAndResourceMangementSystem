import { IQuery } from '@nestjs/cqrs';
import { IGetProjectListQuery } from '../../../interfaces/query/get-project-list-query.interface';

/**
 * 프로젝트 목록 조회 Query
 */
export class GetProjectListQuery implements IQuery {
    constructor(public readonly data: IGetProjectListQuery) {}
}
