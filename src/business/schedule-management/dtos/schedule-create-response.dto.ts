import { ApiProperty } from '@nestjs/swagger';
import { ScheduleType } from '../../../../libs/enums/schedule-type.enum';

/**
 * 생성된 일정 정보 DTO
 */
export class CreatedScheduleDto {
    @ApiProperty({ description: '일정 ID', example: 'uuid-string' })
    scheduleId: string;

    @ApiProperty({ description: '일정 제목', example: '주간 팀 회의' })
    title: string;

    @ApiProperty({ description: '시작 날짜 및 시간', example: '2025-08-25T10:00:00Z' })
    startDate: string;

    @ApiProperty({ description: '종료 날짜 및 시간', example: '2025-08-25T11:00:00Z' })
    endDate: string;

    @ApiProperty({ description: '일정 유형', enum: ScheduleType, example: ScheduleType.DEPARTMENT })
    scheduleType: ScheduleType;
}

/**
 * 실패한 일정 정보 DTO
 */
export class FailedScheduleDto {
    @ApiProperty({ description: '시작 날짜 및 시간', example: '2025-08-25T10:00:00Z' })
    startDate: string;

    @ApiProperty({ description: '종료 날짜 및 시간', example: '2025-08-25T11:00:00Z' })
    endDate: string;

    @ApiProperty({ description: '실패 사유', example: '선택한 시간대에 자원이 이미 예약되어 있습니다.' })
    reason: string;
}

/**
 * 일정 생성 응답 DTO
 */
export class ScheduleCreateResponseDto {
    @ApiProperty({
        description: '성공적으로 생성된 일정 목록',
        type: [CreatedScheduleDto],
    })
    createdSchedules: CreatedScheduleDto[];

    @ApiProperty({
        description: '생성에 실패한 일정 목록',
        type: [FailedScheduleDto],
    })
    failedSchedules: FailedScheduleDto[];
}
