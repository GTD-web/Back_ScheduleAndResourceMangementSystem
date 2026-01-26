import { HolidayInfoDTO } from '../../../../domain/holiday-info/holiday-info.types';

/**
 * 휴일 목록 조회 응답 인터페이스
 */
export interface IGetHolidayListResponse {
    holidays: HolidayInfoDTO[];
    totalCount: number;
}
