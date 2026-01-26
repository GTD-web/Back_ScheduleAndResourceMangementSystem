import { EventInfo } from '../../../../domain/event-info/event-info.entity';
import { UsedAttendance } from '../../../../domain/used-attendance/used-attendance.entity';
import { DataSnapshotInfoDTO } from '../../../../domain/data-snapshot-info/data-snapshot-info.types';

/**
 * 스냅샷 데이터 조회 응답 인터페이스
 */
export interface IGetSnapshotDataFromHistoryResponse {
    year: string;
    month: string;
    eventInfos: Partial<EventInfo>[];
    usedAttendances: Partial<UsedAttendance>[];
    snapshot: DataSnapshotInfoDTO;
}
