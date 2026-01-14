export * from './data-snapshot';

// Handler 배열 export (Module 등록용)
import {
    SaveAttendanceSnapshotHandler,
    SaveAllDepartmentsMonthlySnapshotHandler,
    RestoreFromSnapshotHandler,
} from './data-snapshot/commands';
import { GetSnapshotListHandler } from './data-snapshot/queries';

export const COMMAND_HANDLERS = [
    SaveAttendanceSnapshotHandler,
    SaveAllDepartmentsMonthlySnapshotHandler,
    RestoreFromSnapshotHandler,
];

export const QUERY_HANDLERS = [GetSnapshotListHandler];
