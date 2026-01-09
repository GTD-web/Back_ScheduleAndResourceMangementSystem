import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ResourceMonthAvailabilityQueryDto {
    @ApiProperty({
        description: '자원 ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    resourceId: string;

    @ApiProperty({
        description: '연도',
        example: 2024,
    })
    @IsNumber()
    @Type(() => Number)
    year: number;

    @ApiProperty({
        description: '월',
        example: 1,
        minimum: 1,
        maximum: 12,
    })
    @IsNumber()
    @Min(1)
    @Max(12)
    @Type(() => Number)
    month: number;

    @ApiProperty({
        description: '시작시간',
        example: '09:00',
    })
    @IsString()
    startTime: string;

    @ApiProperty({
        description: '종료시간',
        example: '18:00',
    })
    @IsString()
    endTime: string;
}
