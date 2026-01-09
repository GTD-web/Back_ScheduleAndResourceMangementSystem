import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { YearMonthFilterDto } from './base.dto';

export class ResourceUsageStatsFilterDto extends YearMonthFilterDto {
    @ApiProperty({ required: false, description: '자원 ID' })
    @IsOptional()
    @IsString()
    resourceId?: string;

    @ApiProperty({ required: false, description: '직원 ID' })
    @IsOptional()
    @IsString()
    employeeId?: string;

    @ApiProperty({ required: false, description: '자원 유형' })
    @IsOptional()
    @IsString()
    resourceType?: string;
}

export class ResourceUsageStatsResponseDto {
    @ApiProperty({ description: '자원 ID' })
    resourceId: string;

    @ApiProperty({ description: '자원 이름' })
    resourceName: string;

    @ApiProperty({ description: '자원 유형' })
    resourceType: string;

    @ApiProperty({ description: '직원 ID' })
    employeeId: string;

    @ApiProperty({ description: '직원 이름' })
    employeeName: string;

    @ApiProperty({ description: '연도' })
    year: number;

    @ApiProperty({ description: '월' })
    month: number;

    @ApiProperty({ description: '연월 (YYYY-MM)' })
    yearMonth: string;

    @ApiProperty({ description: '예약 횟수' })
    reservationCount: number;

    @ApiProperty({ description: '총 이용 시간 (시간)' })
    totalHours: number;

    @ApiProperty({ description: '예약 횟수 순위' })
    countRank: number;

    @ApiProperty({ description: '이용 시간 순위' })
    hoursRank: number;

    @ApiProperty({ description: '통계 계산 시점' })
    computedAt: Date;
}
