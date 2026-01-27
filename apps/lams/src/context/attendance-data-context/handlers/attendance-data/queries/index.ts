export * from './get-monthly-summaries.query';
export * from './get-monthly-summaries.handler';
export * from './get-daily-summary-history.query';
export * from './get-daily-summary-history.handler';

// Query Handler 배열 export (Module 등록용)
import { GetMonthlySummariesHandler } from './get-monthly-summaries.handler';
import { GetDailySummaryHistoryHandler } from './get-daily-summary-history.handler';

export const ATTENDANCE_DATA_QUERY_HANDLERS = [GetMonthlySummariesHandler, GetDailySummaryHistoryHandler];
