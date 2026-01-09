import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 페이지네이션 메타데이터 DTO
 */
export class PaginationMetaDto {
    @ApiProperty({
        description: '전체 아이템 수',
        type: Number,
        example: 100,
    })
    total: number;

    @ApiPropertyOptional({
        description: '현재 페이지 번호',
        type: Number,
        example: 1,
    })
    page?: number;

    @ApiPropertyOptional({
        description: '페이지당 아이템 수',
        type: Number,
        example: 20,
    })
    limit?: number;

    @ApiPropertyOptional({
        description: '다음 페이지 존재 여부',
        type: Boolean,
        example: true,
    })
    hasNext?: boolean;
}

/**
 * 페이지네이션 데이터 구조
 */
export class PaginationData<T> {
    @ApiProperty({
        description: '결과 아이템 배열',
        isArray: true,
    })
    items: T[];

    @ApiProperty({
        description: '페이지네이션 메타데이터',
        type: PaginationMetaDto,
    })
    meta: PaginationMetaDto;
}
