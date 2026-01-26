import { HolidayInfoDTO } from '../../../../domain/holiday-info/holiday-info.types';

/**
 * 휴일 정보 수정 응답 인터페이스
 */
export interface IUpdateHolidayInfoResponse {
    holidayInfo: HolidayInfoDTO;
}
