import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { YearMonthFilterDto } from './base.dto';

export class ConsumableMaintenanceStatsFilterDto extends YearMonthFilterDto {
    @ApiProperty({ required: false, description: '자원 ID' })
    @IsOptional()
    @IsString()
    resourceId?: string;

    @ApiProperty({ required: false, description: '차량 정보 ID' })
    @IsOptional()
    @IsString()
    vehicleInfoId?: string;

    @ApiProperty({ required: false, description: '소모품 ID' })
    @IsOptional()
    @IsString()
    consumableId?: string;

    @ApiProperty({ required: false, description: '최소 정비 횟수' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minMaintenanceCount?: number;
}

export class ConsumableMaintenanceStatsResponseDto {
    @ApiProperty({ description: '자원 ID' })
    resourceId: string;

    @ApiProperty({ description: '자원 이름' })
    resourceName: string;

    @ApiProperty({ description: '자원 유형' })
    resourceType: string;

    @ApiProperty({ description: '차량 정보 ID' })
    vehicleInfoId: string;

    @ApiProperty({ description: '차량 번호' })
    vehicleNumber: string;

    @ApiProperty({ description: '소모품 ID' })
    consumableId: string;

    @ApiProperty({ description: '소모품 이름' })
    consumableName: string;

    @ApiProperty({ description: '교체 주기' })
    replaceCycle: number;

    @ApiProperty({ description: '교체 주기 알림 여부' })
    notifyReplacementCycle: boolean;

    @ApiProperty({ description: '정비 횟수' })
    maintenanceCount: number;

    @ApiProperty({ description: '첫 정비 날짜' })
    firstMaintenanceDate: Date;

    @ApiProperty({ description: '마지막 정비 날짜' })
    lastMaintenanceDate: Date;

    @ApiProperty({ description: '총 비용' })
    totalCost: number;

    @ApiProperty({ description: '평균 비용' })
    averageCost: number;

    @ApiProperty({ description: '최소 주행 거리' })
    minMileage: number;

    @ApiProperty({ description: '최대 주행 거리' })
    maxMileage: number;

    @ApiProperty({ description: '평균 주행 거리' })
    averageMileage: number;

    @ApiProperty({ description: '정비 간 평균 일수' })
    averageDaysBetweenMaintenances: number;

    @ApiProperty({ description: '현재 연도' })
    currentYear: number;

    @ApiProperty({ description: '현재 월' })
    currentMonth: number;

    @ApiProperty({ description: '최근 3개월 정비 횟수' })
    recentMaintenanceCount: number;

    @ApiProperty({ description: '통계 계산 시점' })
    computedAt: Date;
}
