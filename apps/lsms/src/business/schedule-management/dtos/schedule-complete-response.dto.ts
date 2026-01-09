import { ApiProperty } from '@nestjs/swagger';

/**
 * 완료된 예약 정보 DTO
 */
export class CompletedReservationDto {
    @ApiProperty({ description: '예약 ID', example: 'uuid-string' })
    reservationId: string;

    @ApiProperty({ description: '예약 상태', example: 'CLOSED' })
    status: string;
}

/**
 * 일정 완료 응답 DTO
 */
export class ScheduleCompleteResponseDto {
    @ApiProperty({ description: '일정 ID', example: 'uuid-string' })
    scheduleId: string;

    @ApiProperty({ description: '일정 제목', example: '주간 팀 회의' })
    title: string;

    @ApiProperty({ description: '일정 상태', example: 'COMPLETED' })
    status: string;

    @ApiProperty({ description: '완료된 시간', example: '2025-01-20T15:30:00.000Z' })
    completedAt: Date;

    @ApiProperty({
        description: '완료 메모',
        example: '회의가 성공적으로 완료되었습니다.',
        required: false,
    })
    completionNotes?: string;

    @ApiProperty({
        description: '연결된 예약 정보',
        type: CompletedReservationDto,
        required: false,
    })
    reservation?: CompletedReservationDto;
}
