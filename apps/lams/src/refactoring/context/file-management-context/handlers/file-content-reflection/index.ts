import {
    ProcessFileContentHandler,
    DeleteExistingDataForReflectionHandler,
    SaveReflectedDataHandler,
    SaveReflectionHistoryHandler,
} from './commands';
import { GetSnapshotDataFromHistoryHandler } from './queries';

export const FILE_CONTENT_REFLECTION_HANDLERS = [
    ProcessFileContentHandler,
    DeleteExistingDataForReflectionHandler,
    SaveReflectedDataHandler,
    SaveReflectionHistoryHandler,
    GetSnapshotDataFromHistoryHandler,
];

