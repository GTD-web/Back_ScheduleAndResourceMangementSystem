import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * 이력으로 되돌리기 요청 DTO
 */
export class RestoreFromHistoryRequestDto {
    @ApiProperty({
        description: '반영 이력 ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsNotEmpty()
    reflectionHistoryId: string;

    @ApiProperty({
        description: '연도',
        example: '2024',
    })
    @IsString()
    @IsNotEmpty()
    year: string;

    @ApiProperty({
        description: '월',
        example: '01',
    })
    @IsString()
    @IsNotEmpty()
    month: string;
}

/**
 * 이력으로 되돌리기 응답 DTO
 */
export class RestoreFromHistoryResponseDto {
    @ApiProperty({ description: '원본 반영 이력 ID' })
    reflectionHistoryId: string;

    @ApiProperty({ description: '일일 요약 생성 결과' })
    dailySummaryResult: {
        statistics: {
            dailyEventSummaryCount: number;
            attendanceIssueCount: number;
        };
    };

    @ApiProperty({ description: '월간 요약 생성 결과' })
    monthlySummaryResult: {
        statistics: {
            monthlyEventSummaryCount: number;
        };
    };
}
