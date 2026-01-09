import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 일정 연장 요청 DTO
 */
export class ScheduleExtendRequestDto {
    @ApiProperty({
        description: '새로운 종료 날짜 및 시간',
        example: '2025-08-25T13:00:00Z',
    })
    @IsDateString()
    newEndDate: string;

    @ApiProperty({
        description: '연장 사유',
        example: '논의할 내용이 많아 30분 연장합니다.',
        required: false,
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: '연장 사유는 500자를 초과할 수 없습니다.' })
    reason?: string;
}
