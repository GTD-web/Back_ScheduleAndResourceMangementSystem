import { ApiProperty } from '@nestjs/swagger';

/**
 * 변경 내역 정보 DTO
 */
export class ScheduleChangeDto {
    @ApiProperty({ description: '변경 전 값' })
    from: any;

    @ApiProperty({ description: '변경 후 값' })
    to: any;
}

/**
 * 수정된 예약 정보 DTO
 */
export class UpdatedReservationDto {
    @ApiProperty({ description: '예약 ID', example: 'uuid-string' })
    reservationId: string;

    @ApiProperty({ description: '예약 제목', example: '수정된 주간 팀 회의' })
    title: string;

    @ApiProperty({ description: '예약 시작 시간', example: '2025-08-25T10:00:00.000Z' })
    startDate: Date;

    @ApiProperty({ description: '예약 종료 시간', example: '2025-08-25T11:00:00.000Z' })
    endDate: Date;
}

/**
 * 일정 수정 응답 DTO
 */
export class ScheduleUpdateResponseDto {
    @ApiProperty({ description: '일정 ID', example: 'uuid-string' })
    scheduleId: string;

    @ApiProperty({ description: '일정 제목', example: '수정된 주간 팀 회의' })
    title: string;

    @ApiProperty({
        description: '일정 설명',
        example: '수정된 회의 설명입니다.',
        required: false,
    })
    description?: string;

    @ApiProperty({ description: '시작 날짜 및 시간', example: '2025-08-25T10:00:00.000Z' })
    startDate: Date;

    @ApiProperty({ description: '종료 날짜 및 시간', example: '2025-08-25T11:00:00.000Z' })
    endDate: Date;

    @ApiProperty({
        description: '변경 내역',
        type: 'object',
        example: {
            title: { from: '기존 제목', to: '새로운 제목' },
            startDate: { from: '2025-08-25T09:00:00.000Z', to: '2025-08-25T10:00:00.000Z' },
        },
    })
    changes: Record<string, { from: any; to: any }>;

    @ApiProperty({
        description: '수정 사유',
        example: '시간 변경 요청으로 인한 수정입니다.',
        required: false,
    })
    reason?: string;

    @ApiProperty({
        description: '연결된 예약 정보',
        type: UpdatedReservationDto,
        required: false,
    })
    reservation?: UpdatedReservationDto;
}
