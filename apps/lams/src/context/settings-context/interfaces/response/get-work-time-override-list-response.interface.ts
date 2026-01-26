import { WorkTimeOverrideDTO } from '../../../../domain/work-time-override/work-time-override.types';

/**
 * 특별근태시간 목록 조회 응답 인터페이스
 */
export interface IGetWorkTimeOverrideListResponse {
    workTimeOverrides: WorkTimeOverrideDTO[];
    totalCount: number;
}
