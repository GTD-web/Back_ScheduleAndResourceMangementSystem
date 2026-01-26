import { IRestoreDailySummariesFromSnapshotCommand } from '../../../interfaces';

/**
 * 스냅샷 기반 일일요약 복원 커맨드
 */
export class RestoreDailySummariesFromSnapshotCommand {
    constructor(public readonly data: IRestoreDailySummariesFromSnapshotCommand) {}
}
