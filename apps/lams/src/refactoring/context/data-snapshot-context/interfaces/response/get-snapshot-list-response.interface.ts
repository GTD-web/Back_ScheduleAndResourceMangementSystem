import { DataSnapshotInfoDTO } from '../../../../domain/data-snapshot-info/data-snapshot-info.types';

/**
 * 스냅샷 목록 조회 응답 인터페이스
 */
export interface IGetSnapshotListResponse {
    /**
     * 해당 연월과 부서의 가장 최신 스냅샷 (조건에 맞는 첫 번째)
     */
    latestSnapshot: DataSnapshotInfoDTO | null;
    /**
     * 전체 스냅샷 목록 (조건에 맞는 모든 스냅샷)
     */
    snapshots: DataSnapshotInfoDTO[];
    /**
     * 전체 스냅샷 수
     */
    totalCount: number;
}
