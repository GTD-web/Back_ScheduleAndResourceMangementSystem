import { ApiProperty } from '@nestjs/swagger';

/**
 * 예약 정보 DTO (취소된 일정에 연결된 예약)
 */
export class CancelledReservationDto {
    @ApiProperty({ description: '예약 ID', example: 'uuid-string' })
    reservationId: string;

    @ApiProperty({ description: '예약 상태', example: 'CANCELLED' })
    status: string;
}

/**
 * 일정 취소 응답 DTO
 */
export class ScheduleCancelResponseDto {
    @ApiProperty({ description: '일정 ID', example: 'uuid-string' })
    scheduleId: string;

    @ApiProperty({ description: '일정 제목', example: '주간 팀 회의' })
    title: string;

    @ApiProperty({ description: '일정 상태', example: 'CANCELLED' })
    status: string;

    @ApiProperty({ description: '취소된 시간', example: '2025-01-20T15:30:00.000Z' })
    cancelledAt: Date;

    @ApiProperty({
        description: '취소 사유',
        example: '급한 업무로 인해 일정을 취소합니다.',
        required: false,
    })
    reason?: string;

    @ApiProperty({
        description: '연결된 예약 정보',
        type: CancelledReservationDto,
        required: false,
    })
    reservation?: CancelledReservationDto;
}
