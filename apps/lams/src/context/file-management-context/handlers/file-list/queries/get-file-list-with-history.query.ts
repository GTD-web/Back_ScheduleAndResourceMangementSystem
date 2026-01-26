import { IQuery } from '@nestjs/cqrs';
import { IGetFileListWithHistoryQuery } from '../../../interfaces/query/get-file-list-with-history-query.interface';

/**
 * 파일 목록과 반영이력 조회 Query
 */
export class GetFileListWithHistoryQuery implements IQuery {
    constructor(public readonly data: IGetFileListWithHistoryQuery) {}
}
