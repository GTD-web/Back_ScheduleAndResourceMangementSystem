/**
 * 스냅샷 ID로 스냅샷과 하위 스냅샷 조회 Query 인터페이스
 */
export interface IGetSnapshotByIdQuery {
    snapshotId: string;
    departmentId?: string;
}
