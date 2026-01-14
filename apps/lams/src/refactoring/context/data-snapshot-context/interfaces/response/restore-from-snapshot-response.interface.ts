/**
 * 스냅샷으로부터 복원 응답 인터페이스
 */
export interface IRestoreFromSnapshotResponse {
    snapshotId: string;
    year: string;
    month: string;
    restoredCount: {
        monthlySummaryCount: number;
        dailySummaryCount: number;
    };
}
