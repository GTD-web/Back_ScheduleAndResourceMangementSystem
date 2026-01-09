import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { YearMonthFilterDto } from './base.dto';

export class EmployeeReservationStatsFilterDto extends YearMonthFilterDto {
    @ApiProperty({ required: false, description: '직원 ID' })
    @IsOptional()
    @IsString()
    employeeId?: string;

    @ApiProperty({ required: false, description: '직원 이름' })
    @IsOptional()
    @IsString()
    employeeName?: string;
}

export class EmployeeReservationStatsResponseDto {
    @ApiProperty({ description: '연도' })
    year: number;

    @ApiProperty({ description: '월' })
    month: number;

    @ApiProperty({ description: '연월 (YYYY-MM)' })
    yearMonth: string;

    @ApiProperty({ description: '직원 ID' })
    employeeId: string;

    @ApiProperty({ description: '직원 이름' })
    employeeName: string;

    @ApiProperty({ description: '총 예약 횟수' })
    reservationCount: number;

    @ApiProperty({ description: '총 이용 시간 (시간)' })
    totalHours: number;

    @ApiProperty({ description: '예약당 평균 이용 시간 (시간)' })
    avgHoursPerReservation: number;

    @ApiProperty({ description: '차량 예약 횟수' })
    vehicleCount: number;

    @ApiProperty({ description: '회의실 예약 횟수' })
    meetingRoomCount: number;

    @ApiProperty({ description: '숙소 예약 횟수' })
    accommodationCount: number;

    @ApiProperty({ description: '취소 횟수' })
    cancellationCount: number;

    @ApiProperty({ description: '통계 계산 시점' })
    computedAt: Date;
}
