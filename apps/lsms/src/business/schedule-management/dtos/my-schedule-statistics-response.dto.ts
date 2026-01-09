import { ApiProperty } from '@nestjs/swagger';

export class StatisticsItemDto {
    @ApiProperty({
        description: '세부항목 라벨',
        example: '예약자',
    })
    label: string;

    @ApiProperty({
        description: '해당 항목의 건수',
        example: 15,
    })
    count: number;
}

export class MyScheduleStatisticsResponseDto {
    @ApiProperty({
        description: '라벨',
        example: '예약자',
    })
    label: string;

    @ApiProperty({
        description: '전체 일정 건수',
        example: 24,
    })
    totalCount: number;

    @ApiProperty({
        description: '통계 요약 정보 (필터 조건에 따라 동적 변경)',
        type: [StatisticsItemDto],
    })
    statistics: StatisticsItemDto[];
}
