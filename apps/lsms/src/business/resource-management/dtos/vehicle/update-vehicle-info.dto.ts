import { ApiProperty } from '@nestjs/swagger';
import {
    IsOptional,
    IsArray,
    IsBoolean,
    Min,
    Max,
    IsInt,
    IsDateString,
    Matches,
    IsString,
    Length,
} from 'class-validator';
import { ERROR_MESSAGE } from '../../../../../libs/constants/error-message';

export class UpdateMaintenanceDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
        message: ERROR_MESSAGE.VALIDATION.INVALID_DATE_FORMAT('날짜', 'YYYY-MM-DD'),
    })
    date?: string;

    @ApiProperty({ required: false })
    @IsInt({ message: ERROR_MESSAGE.VALIDATION.IS_INT('주행거리') })
    @Min(0, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('주행거리') })
    @Max(999999999, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('주행거리') })
    @IsOptional()
    mileage?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt({ message: ERROR_MESSAGE.VALIDATION.IS_INT('비용') })
    @Min(0, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('비용') })
    @Max(999999999, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('비용') })
    cost?: number;

    @ApiProperty({ required: false, type: [String], example: ['123e4567-e89b-12d3-a456-426614174000'] })
    @IsOptional()
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('이미지 파일 ID') })
    images?: string[];

    @ApiProperty({
        description: '소모품 ID',
        example: 'consumable-123',
    })
    @IsOptional()
    consumableId?: string;
}

export class UpdateConsumableDto {
    @ApiProperty({ description: '소모품 이름' })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('소모품 이름') })
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('소모품 이름', 0, 100) })
    name: string;

    @ApiProperty({ description: '소모품 교체 주기' })
    @IsInt({ message: ERROR_MESSAGE.VALIDATION.IS_INT('소모품 교체 주기') })
    @Min(0, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('소모품 교체 주기') })
    @Max(999999999, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('소모품 교체 주기') })
    replaceCycle: number;

    @ApiProperty({ default: true, description: '소모품 교체 알림 주기' })
    @IsBoolean({ message: ERROR_MESSAGE.VALIDATION.IS_BOOLEAN('소모품 교체 알림 주기') })
    @IsOptional()
    notifyReplacementCycle?: boolean;

    @ApiProperty({
        description: '차량 ID',
        example: 'vehicle-123',
    })
    vehicleInfoId: string;
}

export class UpdateVehicleInfoDto {
    @ApiProperty({
        description: '차량 ID',
        example: 'vehicle-123',
    })
    vehicleInfoId: string;

    @ApiProperty({ required: false })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('차량 번호') })
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('차량 번호', 0, 100) })
    @IsOptional()
    vehicleNumber?: string;

    @ApiProperty({ required: false })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('보험 이름') })
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('보험 이름', 0, 100) })
    @IsOptional()
    insuranceName?: string;

    @ApiProperty({ required: false })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('보험 번호') })
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('보험 번호', 0, 100) })
    @IsOptional()
    insuranceNumber?: string;

    @ApiProperty({ required: false })
    @IsInt({ message: ERROR_MESSAGE.VALIDATION.IS_INT('총 주행거리') })
    @Min(0, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('총 주행거리') })
    @Max(999999999, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('총 주행거리') })
    @IsOptional()
    totalMileage?: number;

    @ApiProperty({ required: false })
    @IsInt({ message: ERROR_MESSAGE.VALIDATION.IS_INT('남은 주행거리') })
    @Min(0, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('남은 주행거리') })
    @Max(999999999, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('남은 주행거리') })
    @IsOptional()
    leftMileage?: number;

    @ApiProperty({ required: false, type: [String], example: ['123e4567-e89b-12d3-a456-426614174000'] })
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('주차 위치 이미지 파일 ID') })
    @IsOptional()
    parkingLocationImages?: string[];

    @ApiProperty({ required: false, type: [String], example: ['123e4567-e89b-12d3-a456-426614174000'] })
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('주행거리계 이미지 파일 ID') })
    @IsOptional()
    odometerImages?: string[];

    @ApiProperty({ required: false, type: [String], example: ['123e4567-e89b-12d3-a456-426614174000'] })
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('실내 이미지 파일 ID') })
    @IsOptional()
    indoorImages?: string[];
}
