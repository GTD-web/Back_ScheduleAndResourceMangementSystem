export * from './get-monthly-summaries.query';
export * from './get-monthly-summaries.handler';
export * from './get-monthly-summary-note.query';
export * from './get-monthly-summary-note.handler';
export * from './get-daily-summary-history.query';
export * from './get-daily-summary-history.handler';
export * from './get-daily-summary-detail.query';
export * from './get-daily-summary-detail.handler';

// Query Handler 배열 export (Module 등록용)
import { GetMonthlySummariesHandler } from './get-monthly-summaries.handler';
import { GetMonthlySummaryNoteHandler } from './get-monthly-summary-note.handler';
import { GetDailySummaryHistoryHandler } from './get-daily-summary-history.handler';
import { GetDailySummaryDetailHandler } from './get-daily-summary-detail.handler';

export const ATTENDANCE_DATA_QUERY_HANDLERS = [
    GetMonthlySummariesHandler,
    GetMonthlySummaryNoteHandler,
    GetDailySummaryHistoryHandler,
    GetDailySummaryDetailHandler,
];
