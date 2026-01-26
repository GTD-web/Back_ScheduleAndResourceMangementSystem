import { HolidayInfoDTO } from '../../../../domain/holiday-info/holiday-info.types';

/**
 * 휴일 정보 생성 응답 인터페이스
 */
export interface ICreateHolidayInfoResponse {
    holidayInfo: HolidayInfoDTO;
}
