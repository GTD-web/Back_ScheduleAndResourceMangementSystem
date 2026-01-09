export * from './attendance-data';

// Handler 배열 export (Module 등록용)
import { ATTENDANCE_DATA_COMMAND_HANDLERS } from './attendance-data';

export const COMMAND_HANDLERS = [...ATTENDANCE_DATA_COMMAND_HANDLERS];

export const QUERY_HANDLERS = []; // Query Handler는 추후 추가

