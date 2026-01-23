import { EventInfo } from '../../../../domain/event-info/event-info.entity';
import { UsedAttendance } from '../../../../domain/used-attendance/used-attendance.entity';

/**
 * 반영 데이터 저장 커맨드 인터페이스
 */
export interface ISaveReflectedDataCommand {
    eventInfos: Partial<EventInfo>[];
    usedAttendances: Partial<UsedAttendance>[];
}
