import { Min, Max, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
    @ApiPropertyOptional({
        description: '페이지 번호 (1부터 시작)',
        type: Number,
        default: 1,
        minimum: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({
        description: '한 페이지당 항목 수',
        type: Number,
        default: 100,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 100;

    /**
     * 오프셋 계산 헬퍼 메서드
     */
    getOffset(): number {
        return (this.page - 1) * this.limit;
    }
}
