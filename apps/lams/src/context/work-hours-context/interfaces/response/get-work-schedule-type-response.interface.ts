import { WorkScheduleTypeDTO } from '../../../../domain/work-schedule-type/work-schedule-type.types';

/**
 * 근무 유형 조회 응답 인터페이스
 */
export interface IGetWorkScheduleTypeResponse {
    scheduleType: WorkScheduleTypeDTO | null;
}
