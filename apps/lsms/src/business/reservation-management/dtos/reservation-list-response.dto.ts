import { ApiProperty } from '@nestjs/swagger';
import { ReservationWithRelationsResponseDto } from './reservation-response.dto';

export class ReservationListResponseDto {
    @ApiProperty({
        description: '예약 목록',
        type: [ReservationWithRelationsResponseDto],
    })
    reservations: ReservationWithRelationsResponseDto[];

    @ApiProperty({
        description: '전체 예약 수',
        example: 150,
    })
    totalCount: number;

    @ApiProperty({
        description: '필터링된 예약 수',
        example: 25,
    })
    filteredCount: number;

    @ApiProperty({
        description: '전체 페이지 수',
        example: 3,
    })
    totalPages: number;

    @ApiProperty({
        description: '다음 페이지 존재 여부',
        example: true,
    })
    hasNext: boolean;

    @ApiProperty({
        description: '이전 페이지 존재 여부',
        example: false,
    })
    hasPrevious: boolean;
}
