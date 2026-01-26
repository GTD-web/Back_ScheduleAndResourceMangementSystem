/**
 * 휴일 정보 생성 Command 인터페이스
 */
export interface ICreateHolidayInfoCommand {
    holidayName: string;
    holidayDate: string;
    performedBy: string;
}
