import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DailyAvailabilityDto {
    @ApiProperty({
        description: '날짜 (YYYY-MM-DD 형식)',
        example: '2024-01-01',
    })
    date: string;

    @ApiProperty({
        description: '일',
        example: 1,
        minimum: 1,
        maximum: 31,
    })
    day: number;

    @ApiProperty({
        description: '예약 가능 여부',
        example: true,
    })
    available: boolean;
}

export class ResourceMonthAvailabilityResponseDto {
    @ApiProperty({
        description: '각 날짜별 예약 가능 여부',
        type: [DailyAvailabilityDto],
    })
    dailyAvailability: DailyAvailabilityDto[];
}
