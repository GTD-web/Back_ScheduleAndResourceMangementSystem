import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 일정 완료 요청 DTO
 */
export class ScheduleCompleteRequestDto {
    @ApiProperty({
        description: '완료 메모',
        example: '회의가 성공적으로 완료되었습니다. 다음 액션 아이템들이 논의되었습니다.',
        required: false,
        maxLength: 1000,
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: '완료 메모는 1000자를 초과할 수 없습니다.' })
    completionNotes?: string;
}
