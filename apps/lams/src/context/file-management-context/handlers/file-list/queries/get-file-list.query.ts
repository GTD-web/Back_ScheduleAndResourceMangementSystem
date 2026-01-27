import { IQuery } from '@nestjs/cqrs';
import { IGetFileListQuery } from '../../../interfaces/query/get-file-list-query.interface';

/**
 * 파일 목록 조회 Query
 */
export class GetFileListQuery implements IQuery {
    constructor(public readonly data: IGetFileListQuery) {}
}
