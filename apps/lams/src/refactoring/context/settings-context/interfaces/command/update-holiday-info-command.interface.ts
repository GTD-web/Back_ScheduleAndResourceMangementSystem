/**
 * 휴일 정보 수정 Command 인터페이스
 */
export interface IUpdateHolidayInfoCommand {
    id: string;
    holidayName?: string;
    holidayDate?: string;
    performedBy: string;
}
