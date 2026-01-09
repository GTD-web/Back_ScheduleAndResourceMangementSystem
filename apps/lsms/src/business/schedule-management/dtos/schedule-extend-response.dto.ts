import { ApiProperty } from '@nestjs/swagger';

/**
 * 연장된 예약 정보 DTO
 */
export class ExtendedReservationDto {
    @ApiProperty({ description: '예약 ID', example: 'uuid-string' })
    reservationId: string;

    @ApiProperty({ description: '예약 종료 시간', example: '2025-08-25T13:00:00.000Z' })
    endDate: Date;
}

/**
 * 일정 연장 응답 DTO
 */
export class ScheduleExtendResponseDto {
    @ApiProperty({ description: '일정 ID', example: 'uuid-string' })
    scheduleId: string;

    @ApiProperty({ description: '일정 제목', example: '주간 팀 회의' })
    title: string;

    @ApiProperty({ description: '기존 종료 시간', example: '2025-08-25T11:00:00.000Z' })
    originalEndDate: Date;

    @ApiProperty({ description: '새로운 종료 시간', example: '2025-08-25T13:00:00.000Z' })
    newEndDate: Date;

    @ApiProperty({
        description: '연장 사유',
        example: '논의할 내용이 많아 30분 연장합니다.',
        required: false,
    })
    reason?: string;

    @ApiProperty({
        description: '연결된 예약 정보',
        type: ExtendedReservationDto,
        required: false,
    })
    reservation?: ExtendedReservationDto;
}
