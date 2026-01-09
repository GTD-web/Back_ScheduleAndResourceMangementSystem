import { ApiProperty } from '@nestjs/swagger';
import { ParticipantsType } from '../../../../libs/enums/reservation-type.enum';

export class ReservationDto {
    @ApiProperty({
        description: '자원 예약 ID',
        example: 'uuid-string',
    })
    reservationId: string;

    @ApiProperty({
        description: '자원 이름',
        example: '자원 1',
    })
    resourceName: string;

    @ApiProperty({
        description: '자원 타입',
        example: '자원 1',
    })
    resourceType: string;
}

export class ProjectDto {
    @ApiProperty({
        description: '프로젝트 ID',
        example: 'uuid-string',
    })
    projectId: string;

    @ApiProperty({
        description: '프로젝트 이름',
        example: '프로젝트 1',
    })
    projectName: string;
}

export class ParticipantDto {
    @ApiProperty({
        description: '참가자 ID',
        example: 'uuid-string',
    })
    participantId: string;

    @ApiProperty({
        description: '참가자 타입',
        example: 'RESERVER',
        enum: ParticipantsType,
    })
    type: ParticipantsType;

    @ApiProperty({
        description: '직원 ID',
        example: 'uuid-string',
        required: false,
    })
    employeeId?: string;

    @ApiProperty({
        description: '직원 이름',
        example: '홍길동',
        required: false,
    })
    employeeName?: string;

    @ApiProperty({
        description: '부서명',
        example: '개발팀',
        required: false,
    })
    department?: string;
}

export class ScheduleCalendarItemDto {
    @ApiProperty({
        description: '일정 ID',
        example: 'uuid-string',
    })
    scheduleId: string;

    @ApiProperty({
        description: '일정 제목',
        example: '프로젝트 회의',
    })
    scheduleTitle: string;

    @ApiProperty({
        description: '시작 날짜 및 시간',
        example: '2024-01-15T09:00:00Z',
    })
    startDate: Date;

    @ApiProperty({
        description: '종료 날짜 및 시간',
        example: '2024-01-15T10:00:00Z',
    })
    endDate: Date;

    @ApiProperty({
        description: '예약자 정보',
        example: '홍길동',
    })
    reserverName: string;

    @ApiProperty({
        description: '일정 타입',
        example: 'COMPANY',
        required: false,
    })
    scheduleType: string;

    @ApiProperty({
        description: '프로젝트 정보',
        example: '프로젝트 1',
        required: false,
    })
    project?: ProjectDto;

    @ApiProperty({
        description: '자원 예약 정보',
        example: '자원 예약 1',
        required: false,
    })
    reservation?: ReservationDto;

    @ApiProperty({
        description: '안읽은 알림 여부',
        example: true,
        required: false,
    })
    hasUnreadNotification?: boolean;

    @ApiProperty({
        description: '안읽은 알림 ID',
        example: 'uuid-string',
        required: false,
    })
    notificationId?: string;

    @ApiProperty({
        description: '참가자 목록',
        type: [ParticipantDto],
        required: false,
    })
    participants?: ParticipantDto[];
}

export class DateGroupDto {
    @ApiProperty({
        description: '날짜 (YYYY-MM-DD)',
        example: '2024-01-15',
    })
    date: string;

    @ApiProperty({
        description: '요일',
        example: '월요일',
    })
    dayOfWeek: string;

    @ApiProperty({
        description: '해당 날짜의 일정 수',
        example: 4,
    })
    count: number;

    @ApiProperty({
        description: '해당 날짜의 일정 목록',
        type: [ScheduleCalendarItemDto],
    })
    schedules: ScheduleCalendarItemDto[];
}

export class EmployeeGroupDto {
    @ApiProperty({
        description: '직원 ID',
        example: 'uuid-string',
    })
    employeeId: string;

    @ApiProperty({
        description: '직원 이름',
        example: '홍길동',
    })
    employeeName: string;

    @ApiProperty({
        description: '부서명',
        example: '개발팀',
    })
    department: string;

    @ApiProperty({
        description: '일정 수',
        example: 5,
    })
    count: number;

    @ApiProperty({
        description: '참가자 타입별 카운트',
        example: {
            reserver: 3,
            participant: 2,
            ccRecipient: 0,
        },
    })
    types: {
        reserver: number;
        participant: number;
        ccRecipient: number;
    };

    @ApiProperty({
        description: '해당 직원의 일정 목록',
        type: [ScheduleCalendarItemDto],
    })
    schedules: ScheduleCalendarItemDto[];

    @ApiProperty({
        description: '해당 직원의 날짜별 그룹화된 일정',
        type: [DateGroupDto],
    })
    dateGroups: DateGroupDto[];
}

export class CalendarResourceGroupDto {
    @ApiProperty({
        description: '자원 ID',
        example: 'uuid-string',
    })
    resourceId: string;

    @ApiProperty({
        description: '자원 이름',
        example: '회의실 A',
    })
    resourceName: string;

    @ApiProperty({
        description: '자원 타입',
        example: 'MEETING_ROOM',
    })
    resourceType: string;

    @ApiProperty({
        description: '위치',
        example: '3층',
    })
    location: string;

    @ApiProperty({
        description: '일정 수',
        example: 8,
    })
    count: number;

    @ApiProperty({
        description: '해당 자원의 일정 목록',
        type: [ScheduleCalendarItemDto],
    })
    schedules: ScheduleCalendarItemDto[];

    @ApiProperty({
        description: '해당 자원의 날짜별 그룹화된 일정',
        type: [DateGroupDto],
    })
    dateGroups: DateGroupDto[];
}

export class ProjectGroupDto {
    @ApiProperty({
        description: '프로젝트 ID',
        example: 'uuid-string',
    })
    projectId: string;

    @ApiProperty({
        description: '프로젝트 이름',
        example: 'RMS 개발 프로젝트',
    })
    projectName: string;

    @ApiProperty({
        description: '프로젝트 설명',
        example: '자원 관리 시스템 개발',
        required: false,
    })
    projectDescription?: string;

    @ApiProperty({
        description: '일정 수',
        example: 12,
    })
    count: number;

    @ApiProperty({
        description: '해당 프로젝트의 일정 목록',
        type: [ScheduleCalendarItemDto],
    })
    schedules: ScheduleCalendarItemDto[];

    @ApiProperty({
        description: '해당 프로젝트의 날짜별 그룹화된 일정',
        type: [DateGroupDto],
    })
    dateGroups: DateGroupDto[];
}

export class ScheduleCalendarResponseDto {
    @ApiProperty({
        description: '일정 목록',
        type: [ScheduleCalendarItemDto],
    })
    schedules: ScheduleCalendarItemDto[];

    @ApiProperty({
        description: '직원별 그룹화된 일정 (각 직원 내에서 날짜별로도 그룹화)',
        type: [EmployeeGroupDto],
        required: false,
    })
    employees?: EmployeeGroupDto[];

    @ApiProperty({
        description: '자원별 그룹화된 일정 (각 자원 내에서 날짜별로도 그룹화)',
        type: [CalendarResourceGroupDto],
        required: false,
    })
    resources?: CalendarResourceGroupDto[];

    @ApiProperty({
        description: '프로젝트별 그룹화된 일정 (각 프로젝트 내에서 날짜별로도 그룹화)',
        type: [ProjectGroupDto],
        required: false,
    })
    projects?: ProjectGroupDto[];
}
