import { ApiProperty } from '@nestjs/swagger';
import { MyScheduleProjectDto, MyScheduleResourceDto } from './my-schedule-response.dto';

export class MyScheduleParticipantDto {
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
        description: '직원 상태',
        example: '재직중',
    })
    status: string;
}

export class MyScheduleHistoryItemDto {
    @ApiProperty({
        description: '일정 ID',
        example: 'uuid-string',
    })
    scheduleId: string;

    @ApiProperty({
        description: '일정 제목',
        example: '주간 프로젝트 회의',
    })
    title: string;

    @ApiProperty({
        description: '일정 설명',
        required: false,
        example: '주간 진행사항 점검 및 이슈 논의',
    })
    description?: string;

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
        description: '일정 유형',
        example: '프로젝트',
        enum: ['일정', '프로젝트', '자원'],
    })
    scheduleType: string;

    @ApiProperty({
        description: '일정 담당 부서',
        example: '영업팀',
        required: false,
    })
    scheduleDepartment?: string;

    @ApiProperty({
        description: '시작 전 알림 시점 (분 단위)',
        type: [Number],
        required: false,
        example: [10, 30],
    })
    notifyMinutesBeforeStart?: number[];

    @ApiProperty({
        description: '생성 일시',
        example: '2024-01-15T09:00:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: '수정 일시',
        example: '2024-01-15T09:00:00Z',
    })
    updatedAt: Date;

    @ApiProperty({
        description: '참석자 정보',
        type: [MyScheduleParticipantDto],
    })
    participants?: MyScheduleParticipantDto[];

    @ApiProperty({
        description: '관련 프로젝트 정보',
        type: MyScheduleProjectDto,
        required: false,
    })
    project?: MyScheduleProjectDto;

    @ApiProperty({
        description: '관련 자원 정보',
        type: MyScheduleResourceDto,
        required: false,
    })
    resource?: MyScheduleResourceDto;
}

export class MyScheduleHistoryResponseDto {
    @ApiProperty({
        description: '현재 페이지',
        example: 1,
    })
    currentPage: number;

    @ApiProperty({
        description: '페이지당 항목 수',
        example: 20,
    })
    pageSize: number;

    @ApiProperty({
        description: '총 페이지 수',
        example: 3,
    })
    totalPages: number;

    @ApiProperty({
        description: '다음 페이지 존재 여부',
        example: true,
    })
    hasNext: boolean;

    @ApiProperty({
        description: '이전 페이지 존재 여부',
        example: false,
    })
    hasPrevious: boolean;

    @ApiProperty({
        description: '일정 목록',
        type: [MyScheduleHistoryItemDto],
    })
    schedules: MyScheduleHistoryItemDto[];
}
