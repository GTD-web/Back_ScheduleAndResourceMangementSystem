import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsArray,
    IsBoolean,
    Max,
    Min,
    IsInt,
    Length,
    IsDateString,
    Matches,
} from 'class-validator';
import { ERROR_MESSAGE } from '../../../../../libs/constants/error-message';

export class CreateVehicleInfoDto {
    @ApiProperty({ required: true })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('차량 번호') })
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('차량 번호', 0, 100) })
    vehicleNumber: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt({ message: ERROR_MESSAGE.VALIDATION.IS_INT('남은 주행거리') })
    @Min(0, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('남은 주행거리') })
    @Max(999999999, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('남은 주행거리') })
    leftMileage?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt({ message: ERROR_MESSAGE.VALIDATION.IS_INT('총 주행거리') })
    @Min(0, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('총 주행거리') })
    @Max(999999999, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('총 주행거리') })
    totalMileage?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('보험 이름') })
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('보험 이름', 0, 100) })
    insuranceName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('보험사 전화 번호') })
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('보험사 전화 번호', 0, 100) })
    insuranceNumber?: string;

    @ApiProperty({ required: false, type: [String], example: ['123e4567-e89b-12d3-a456-426614174000'] })
    @IsOptional()
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('주차위치 이미지 파일 ID') })
    parkingLocationImages?: string[];

    @ApiProperty({ required: false, type: [String], example: ['123e4567-e89b-12d3-a456-426614174000'] })
    @IsOptional()
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('계기판 이미지 파일 ID') })
    odometerImages?: string[];

    @ApiProperty({ required: false, type: [String], example: ['123e4567-e89b-12d3-a456-426614174000'] })
    @IsOptional()
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('실내 이미지 파일 ID') })
    indoorImages?: string[];
}

export class CreateConsumableDto {
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
    notifyReplacementCycle: boolean;

    @ApiProperty({
        description: '차량 ID',
        example: 'vehicle-123',
    })
    vehicleInfoId: string;

    @ApiProperty({
        description: '초기 주행거리',
        example: 0,
    })
    initMileage: number;
}

export class CreateMaintenanceDto {
    @ApiProperty()
    @IsDateString()
    @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
        message: ERROR_MESSAGE.VALIDATION.INVALID_DATE_FORMAT('날짜', 'YYYY-MM-DD'),
    })
    date: string;

    @ApiProperty()
    @IsInt({ message: ERROR_MESSAGE.VALIDATION.IS_INT('주행거리') })
    @Min(0, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('주행거리') })
    @Max(999999999, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('주행거리') })
    mileage: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt({ message: ERROR_MESSAGE.VALIDATION.IS_INT('비용') })
    @Min(0, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('비용') })
    @Max(999999999, { message: ERROR_MESSAGE.VALIDATION.INVALID_MILEAGE('비용') })
    cost?: number;

    @ApiProperty({ required: false, type: [String], example: ['123e4567-e89b-12d3-a456-426614174000'] })
    @IsOptional()
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('이미지 파일 ID   ') })
    images?: string[];

    // @ApiProperty({ required: false, description: '정비 담당자' })
    // @IsOptional()
    // @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('정비 담당자') })
    // @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('정비 담당자', 0, 100) })
    maintananceBy?: string;

    @ApiProperty({
        description: '소모품 ID',
        example: 'consumable-123',
    })
    consumableId: string;
}
