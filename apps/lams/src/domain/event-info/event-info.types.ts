/**
 * 이벤트 정보 관련 타입 정의
 */

/**
 * 이벤트 정보 생성 데이터
 */
export interface CreateEventInfoData {
    employeeName: string;
    employeeNumber?: string;
    eventTime: string;
    yyyymmdd: string;
    hhmmss: string;
}

/**
 * 이벤트 정보 업데이트 데이터
 */
export interface UpdateEventInfoData {
    employeeName?: string;
    employeeNumber?: string;
    eventTime?: string;
    yyyymmdd?: string;
    hhmmss?: string;
}

/**
 * 이벤트 정보 DTO
 */
export interface EventInfoDTO {
    id: string;
    employeeName: string;
    employeeNumber: string | null;
    eventTime: string;
    yyyymmdd: string;
    hhmmss: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}

