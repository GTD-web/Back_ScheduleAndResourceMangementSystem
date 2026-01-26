export * from './queries';

// Handler 배열 export (Module 등록용)
import { GetFileListWithHistoryHandler } from './queries';

export const QUERY_HANDLERS = [GetFileListWithHistoryHandler];
