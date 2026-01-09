import { ApiProperty } from '@nestjs/swagger';
import { AttendanceType } from '../../../domain/attendance-type/attendance-type.entity';
import { HolidayInfo } from '../../../domain/holiday-info/holiday-info.entity';
import { Department } from '../../../domain/department/department.entity';

/**
 * 메타데이터 전체 조회 응답 DTO
 */
export class MetadataResponseDto {
    @ApiProperty({
        description: '근태 유형 목록',
        type: [AttendanceType],
        example: [
            {
                attendanceTypeId: '4634e036-a43a-445e-8ffb-d6ec0f3f4170',
                title: '연차',
                workTime: 480,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 1,
            },
        ],
    })
    attendanceTypes: AttendanceType[];

    @ApiProperty({
        description: '휴일 정보 목록',
        type: [HolidayInfo],
        example: [
            {
                holidayId: 'uuid',
                holidayName: '신정',
                holidayDate: '2025-01-01',
            },
        ],
    })
    holidays: HolidayInfo[];
}

/**
 * 근태 유형 조회 응답 DTO
 */
export class AttendanceTypesResponseDto {
    @ApiProperty({
        description: '근태 유형 목록',
        type: [AttendanceType],
    })
    attendanceTypes: AttendanceType[];
}

/**
 * 휴일 정보 조회 응답 DTO
 */
export class HolidaysResponseDto {
    @ApiProperty({
        description: '휴일 정보 목록',
        type: [HolidayInfo],
    })
    holidays: HolidayInfo[];
}

/**
 * 부서 정보 조회 응답 DTO
 */
export class DepartmentsResponseDto {
    @ApiProperty({
        description: '부서 정보 목록',
        type: [Department],
        example: [
            {
                id: 'uuid',
                departmentName: '개발팀',
                departmentCode: 'DEV',
                type: 'DEPARTMENT',
                parentDepartmentId: null,
                order: 1,
            },
        ],
    })
    departments: Department[];
}

