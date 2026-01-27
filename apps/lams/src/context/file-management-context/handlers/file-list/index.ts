export * from './queries';

// Handler 배열 export (Module 등록용)
import {
    GetFileListWithHistoryHandler,
    GetFileListHandler,
    GetReflectionHistoryHandler,
    GetFileOrgDataHandler,
} from './queries';

export const QUERY_HANDLERS = [
    GetFileListWithHistoryHandler,
    GetFileListHandler,
    GetReflectionHistoryHandler,
    GetFileOrgDataHandler,
];
