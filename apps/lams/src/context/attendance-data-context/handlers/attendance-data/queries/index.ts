export * from './get-monthly-summaries.query';
export * from './get-monthly-summaries.handler';

// Query Handler 배열 export (Module 등록용)
import { GetMonthlySummariesHandler } from './get-monthly-summaries.handler';

export const ATTENDANCE_DATA_QUERY_HANDLERS = [GetMonthlySummariesHandler];
