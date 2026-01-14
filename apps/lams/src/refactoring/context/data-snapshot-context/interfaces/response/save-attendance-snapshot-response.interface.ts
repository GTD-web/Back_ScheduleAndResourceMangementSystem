import { DataSnapshotInfoDTO } from '../../../../domain/data-snapshot-info/data-snapshot-info.types';

/**
 * 근태 스냅샷 저장 Response 인터페이스
 */
export interface ISaveAttendanceSnapshotResponse {
    snapshot: DataSnapshotInfoDTO;
}
