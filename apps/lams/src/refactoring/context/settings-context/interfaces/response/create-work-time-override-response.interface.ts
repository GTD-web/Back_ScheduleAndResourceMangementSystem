import { WorkTimeOverrideDTO } from '../../../../domain/work-time-override/work-time-override.types';

/**
 * 특별근태시간 생성 응답 인터페이스
 */
export interface ICreateWorkTimeOverrideResponse {
    workTimeOverride: WorkTimeOverrideDTO;
}
