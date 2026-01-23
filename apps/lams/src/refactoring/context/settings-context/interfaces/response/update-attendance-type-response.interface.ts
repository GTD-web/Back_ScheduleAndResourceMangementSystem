import { AttendanceTypeDTO } from '../../../../domain/attendance-type/attendance-type.types';

/**
 * 근태유형 수정 응답 인터페이스
 */
export interface IUpdateAttendanceTypeResponse {
    attendanceType: AttendanceTypeDTO;
}
