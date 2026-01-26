import { DataSnapshotInfoDTO } from '../../../../domain/data-snapshot-info/data-snapshot-info.types';

/**
 * 스냅샷 ID로 스냅샷과 하위 스냅샷 조회 응답 인터페이스
 */
export interface IGetSnapshotByIdResponse {
    snapshot: DataSnapshotInfoDTO;
}
