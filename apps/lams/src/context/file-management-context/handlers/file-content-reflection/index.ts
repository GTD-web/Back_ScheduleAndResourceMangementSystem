import {
    ProcessFileContentHandler,
    DeleteExistingDataForReflectionHandler,
    SaveReflectedDataHandler,
    SaveReflectionHistoryHandler,
    SetReflectionHistorySelectedHandler,
} from './commands';
import { GetSnapshotDataFromHistoryHandler } from './queries';

export const FILE_CONTENT_REFLECTION_HANDLERS = [
    ProcessFileContentHandler,
    DeleteExistingDataForReflectionHandler,
    SaveReflectedDataHandler,
    SaveReflectionHistoryHandler,
    SetReflectionHistorySelectedHandler,
    GetSnapshotDataFromHistoryHandler,
];

