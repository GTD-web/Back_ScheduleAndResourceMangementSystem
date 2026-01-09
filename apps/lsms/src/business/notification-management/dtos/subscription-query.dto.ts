import { IsOptional, IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SubscriptionQueryDto {
    @ApiPropertyOptional({
        description: '직원 ID 목록',
        type: [String],
        example: ['emp-123', 'emp-456'],
        isArray: true,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (!value) return undefined;
        // 단일 값이면 배열로 변환, 이미 배열이면 그대로 반환
        return Array.isArray(value) ? value : [value];
    })
    employeeIds?: string[];
}
