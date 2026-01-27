import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 근무 유형 조회 응답 DTO
 */
export class GetWorkScheduleTypeResponseDto {
    @ApiProperty({ description: '근무 유형 (FIXED: 고정근무, FLEXIBLE: 유연근무)', example: 'FIXED' })
    scheduleType: string;

    @ApiProperty({ description: '시작일', example: '2024-01-01' })
    startDate: string;

    @ApiPropertyOptional({ description: '종료일', example: '2024-12-31' })
    endDate?: string | null;

    @ApiPropertyOptional({ description: '변경 사유' })
    reason?: string | null;
}
