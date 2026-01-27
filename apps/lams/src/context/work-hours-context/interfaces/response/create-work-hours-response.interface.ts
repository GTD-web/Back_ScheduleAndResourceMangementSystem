import { WorkHoursDTO } from '../../../../domain/work-hours/work-hours.types';

/**
 * 시수 입력 응답 인터페이스
 */
export interface ICreateWorkHoursResponse {
    workHours: WorkHoursDTO;
}
