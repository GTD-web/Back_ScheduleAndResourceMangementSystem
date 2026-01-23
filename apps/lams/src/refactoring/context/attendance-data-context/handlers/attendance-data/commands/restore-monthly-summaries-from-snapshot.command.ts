import { IRestoreMonthlySummariesFromSnapshotCommand } from '../../../interfaces';

/**
 * 스냅샷 기반 월간요약 복원 커맨드
 */
export class RestoreMonthlySummariesFromSnapshotCommand {
    constructor(public readonly data: IRestoreMonthlySummariesFromSnapshotCommand) {}
}
