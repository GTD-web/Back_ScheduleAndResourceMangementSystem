import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 일정 취소 요청 DTO
 */
export class ScheduleCancelRequestDto {
    @ApiProperty({
        description: '취소 사유',
        example: '급한 업무로 인해 일정을 취소합니다.',
        required: false,
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: '취소 사유는 500자를 초과할 수 없습니다.' })
    reason?: string;
}
