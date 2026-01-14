export * from './commands';
export * from './queries';

// Handler 배열 export (Module 등록용)
import { SaveAttendanceSnapshotHandler } from './commands';
import { GetSnapshotListHandler } from './queries';

export const DATA_SNAPSHOT_COMMAND_HANDLERS = [SaveAttendanceSnapshotHandler];
export const DATA_SNAPSHOT_QUERY_HANDLERS = [GetSnapshotListHandler];
