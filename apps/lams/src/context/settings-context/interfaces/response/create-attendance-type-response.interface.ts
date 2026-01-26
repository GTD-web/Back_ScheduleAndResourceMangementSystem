import { AttendanceTypeDTO } from '../../../../domain/attendance-type/attendance-type.types';

/**
 * 근태유형 생성 응답 인터페이스
 */
export interface ICreateAttendanceTypeResponse {
    attendanceType: AttendanceTypeDTO;
}
