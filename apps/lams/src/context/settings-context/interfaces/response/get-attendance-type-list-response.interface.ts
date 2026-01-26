import { AttendanceTypeDTO } from '../../../../domain/attendance-type/attendance-type.types';

/**
 * 근태유형 목록 조회 응답 인터페이스
 */
export interface IGetAttendanceTypeListResponse {
    attendanceTypes: AttendanceTypeDTO[];
    totalCount: number;
}
