import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class DateRangeFilterDto {
    @ApiProperty({ required: false, description: '시작 날짜' })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiProperty({ required: false, description: '종료 날짜' })
    @IsOptional()
    @IsString()
    endDate?: string;
}

export class YearMonthFilterDto {
    @ApiProperty({ required: false, description: '연도' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    year?: number;

    @ApiProperty({ required: false, description: '월' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    month?: number;
}

export class StatisticsResponseDto {
    @ApiProperty({ description: '직원 예약 통계', type: 'array' })
    employeeReservationStats?: any[];

    @ApiProperty({ description: '자원 사용 통계', type: 'array' })
    resourceUsageStats?: any[];

    @ApiProperty({ description: '차량 정비 이력', type: 'array' })
    vehicleMaintenanceHistory?: any[];

    @ApiProperty({ description: '소모품 정비 통계', type: 'array' })
    consumableMaintenanceStats?: any[];
}
