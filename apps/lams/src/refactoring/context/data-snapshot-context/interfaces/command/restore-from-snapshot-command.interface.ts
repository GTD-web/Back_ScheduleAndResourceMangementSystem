/**
 * 스냅샷으로부터 복원 Command 인터페이스
 */
export interface IRestoreFromSnapshotCommand {
    snapshotId: string;
    performedBy: string;
}
