import { IQuery } from '@nestjs/cqrs';
import { IGetFileOrgDataQuery } from '../../../interfaces/query/get-file-org-data-query.interface';

/**
 * 파일 orgData 조회 Query
 */
export class GetFileOrgDataQuery implements IQuery {
    constructor(public readonly data: IGetFileOrgDataQuery) {}
}
