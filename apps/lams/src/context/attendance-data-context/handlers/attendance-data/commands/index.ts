// Command 클래스 export
export * from './generate-daily-summaries.command';
export * from './generate-monthly-summaries.command';
export * from './update-daily-summary.command';
export * from './soft-delete-daily-summaries.command';
export * from './soft-delete-monthly-summaries.command';
export * from './create-attendance-issues.command';
export * from './restore-daily-summaries-from-snapshot.command';
export * from './restore-monthly-summaries-from-snapshot.command';

// Handler 클래스 export
export * from './generate-daily-summaries.handler';
export * from './generate-monthly-summaries.handler';
export * from './update-daily-summary.handler';
export * from './soft-delete-daily-summaries.handler';
export * from './soft-delete-monthly-summaries.handler';
export * from './create-attendance-issues.handler';
export * from './restore-daily-summaries-from-snapshot.handler';
export * from './restore-monthly-summaries-from-snapshot.handler';

// Handler 배열 export (Module 등록용)
import { GenerateDailySummariesHandler } from './generate-daily-summaries.handler';
import { GenerateMonthlySummariesHandler } from './generate-monthly-summaries.handler';
import { UpdateDailySummaryHandler } from './update-daily-summary.handler';
import { SoftDeleteDailySummariesHandler } from './soft-delete-daily-summaries.handler';
import { SoftDeleteMonthlySummariesHandler } from './soft-delete-monthly-summaries.handler';
import { CreateAttendanceIssuesHandler } from './create-attendance-issues.handler';
import { RestoreDailySummariesFromSnapshotHandler } from './restore-daily-summaries-from-snapshot.handler';
import { RestoreMonthlySummariesFromSnapshotHandler } from './restore-monthly-summaries-from-snapshot.handler';

export const ATTENDANCE_DATA_COMMAND_HANDLERS = [
    GenerateDailySummariesHandler,
    GenerateMonthlySummariesHandler,
    UpdateDailySummaryHandler,
    SoftDeleteDailySummariesHandler,
    SoftDeleteMonthlySummariesHandler,
    CreateAttendanceIssuesHandler,
    RestoreDailySummariesFromSnapshotHandler,
    RestoreMonthlySummariesFromSnapshotHandler,
];
