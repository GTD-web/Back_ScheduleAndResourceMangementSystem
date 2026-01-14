// Command 클래스 export
export * from './generate-daily-summaries.command';
export * from './generate-monthly-summaries.command';
export * from './update-daily-summary.command';

// Handler 클래스 export
export * from './generate-daily-summaries.handler';
export * from './generate-monthly-summaries.handler';
export * from './update-daily-summary.handler';

// Handler 배열 export (Module 등록용)
import { GenerateDailySummariesHandler } from './generate-daily-summaries.handler';
import { GenerateMonthlySummariesHandler } from './generate-monthly-summaries.handler';
import { UpdateDailySummaryHandler } from './update-daily-summary.handler';

export const ATTENDANCE_DATA_COMMAND_HANDLERS = [
    GenerateDailySummariesHandler,
    GenerateMonthlySummariesHandler,
    UpdateDailySummaryHandler,
];
