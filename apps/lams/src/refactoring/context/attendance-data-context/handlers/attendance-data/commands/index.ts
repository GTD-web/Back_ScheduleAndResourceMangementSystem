// Command 클래스 export
export * from './generate-daily-summaries.command';
export * from './generate-monthly-summaries.command';

// Handler 클래스 export
export * from './generate-daily-summaries.handler';
export * from './generate-monthly-summaries.handler';

// Handler 배열 export (Module 등록용)
import { GenerateDailySummariesHandler } from './generate-daily-summaries.handler';
import { GenerateMonthlySummariesHandler } from './generate-monthly-summaries.handler';

export const ATTENDANCE_DATA_COMMAND_HANDLERS = [GenerateDailySummariesHandler, GenerateMonthlySummariesHandler];
