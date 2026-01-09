/**
 * 휴일 정보 관련 타입 정의
 */

/**
 * 휴일 정보 생성 데이터
 */
export interface CreateHolidayInfoData {
    holidayName: string;
    holidayDate: string;
}

/**
 * 휴일 정보 업데이트 데이터
 */
export interface UpdateHolidayInfoData {
    holidayName?: string;
    holidayDate?: string;
}

/**
 * 휴일 정보 DTO
 */
export interface HolidayInfoDTO {
    id: string;
    holidayName: string;
    holidayDate: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}

