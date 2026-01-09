import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { DateRangeFilterDto } from './base.dto';

export class VehicleMaintenanceHistoryFilterDto extends DateRangeFilterDto {
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

    @ApiProperty({ required: false, description: '담당자 ID' })
    @IsOptional()
    @IsString()
    responsibleEmployeeId?: string;
}

export class VehicleMaintenanceHistoryResponseDto {
    @ApiProperty({ description: '자원 ID' })
    resourceId: string;

    @ApiProperty({ description: '자원 이름' })
    resourceName: string;

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

    @ApiProperty({ description: '정비 ID' })
    maintenanceId: string;

    @ApiProperty({ description: '정비 날짜' })
    maintenanceDate: string;

    @ApiProperty({ description: '주행 거리' })
    mileage: number;

    @ApiProperty({ description: '비용' })
    cost: number;

    @ApiProperty({ description: '정비 담당자 ID' })
    maintananceBy: string;

    @ApiProperty({ description: '정비 이미지' })
    images: string[];

    @ApiProperty({ description: '생성 시간' })
    createdAt: Date;

    @ApiProperty({ description: '업데이트 시간' })
    updatedAt: Date;

    @ApiProperty({ description: '담당 직원 ID' })
    responsibleEmployeeId: string;

    @ApiProperty({ description: '담당 직원 이름' })
    responsibleEmployeeName: string;

    @ApiProperty({ description: '부서' })
    department: string;

    @ApiProperty({ description: '직급' })
    position: string;

    @ApiProperty({ description: '연도' })
    year: number;

    @ApiProperty({ description: '월' })
    month: number;

    @ApiProperty({ description: '날짜 문자열' })
    dateStr: string;
}
