import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../../../../libs/enums/notification-type.enum';
import { IsEnum, IsObject, IsOptional, IsString, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 소모품 정보 요구사항 DTO
 */
export class NotificationTypeConsumableRequirementsDto {
    @ApiProperty({
        description: '소모품 정보 객체 필요 여부',
        example: true,
    })
    @IsBoolean()
    required: boolean;
}

/**
 * 차량 정보 요구사항 DTO
 */
export class NotificationTypeVehicleInfoRequirementsDto {
    @ApiProperty({
        description: '차량 정보 객체 필요 여부',
        example: true,
    })
    @IsBoolean()
    required: boolean;

    @ApiPropertyOptional({
        type: NotificationTypeConsumableRequirementsDto,
        description: '소모품 정보 중첩 요구사항',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => NotificationTypeConsumableRequirementsDto)
    consumable?: NotificationTypeConsumableRequirementsDto;
}

/**
 * 자원 정보 요구사항 DTO
 */
export class NotificationTypeResourceRequirementsDto {
    @ApiProperty({
        description: '자원 객체 전체 필요 여부',
        example: true,
    })
    @IsBoolean()
    required: boolean;

    @ApiPropertyOptional({
        type: NotificationTypeVehicleInfoRequirementsDto,
        description: '차량 정보 중첩 요구사항',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => NotificationTypeVehicleInfoRequirementsDto)
    vehicleInfo?: NotificationTypeVehicleInfoRequirementsDto;
}

/**
 * 일정 정보 요구사항 DTO
 */
export class NotificationTypeScheduleRequirementsDto {
    @ApiProperty({
        description: '일정 객체 전체 필요 여부',
        example: true,
    })
    @IsBoolean()
    required: boolean;
}

/**
 * 예약 정보 요구사항 DTO
 */
export class NotificationTypeReservationRequirementsDto {
    @ApiProperty({
        description: '예약 객체 전체 필요 여부',
        example: true,
    })
    @IsBoolean()
    required: boolean;
}

/**
 * 프로젝트 정보 요구사항 DTO
 */
export class NotificationTypeProjectRequirementsDto {
    @ApiProperty({
        description: '프로젝트 객체 전체 필요 여부',
        example: true,
    })
    @IsBoolean()
    required: boolean;
}

/**
 * 알림 타입별 필수 정보 정의 DTO
 */
export class NotificationTypeRequirementsDto {
    @ApiPropertyOptional({
        type: NotificationTypeScheduleRequirementsDto,
        description: '일정 정보 관련 요구사항',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => NotificationTypeScheduleRequirementsDto)
    schedule?: NotificationTypeScheduleRequirementsDto;

    @ApiPropertyOptional({
        type: NotificationTypeReservationRequirementsDto,
        description: '예약 정보 관련 요구사항',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => NotificationTypeReservationRequirementsDto)
    reservation?: NotificationTypeReservationRequirementsDto;

    @ApiPropertyOptional({
        type: NotificationTypeResourceRequirementsDto,
        description: '자원 정보 관련 요구사항',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => NotificationTypeResourceRequirementsDto)
    resource?: NotificationTypeResourceRequirementsDto;

    @ApiPropertyOptional({
        type: NotificationTypeProjectRequirementsDto,
        description: '프로젝트 정보 관련 요구사항',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => NotificationTypeProjectRequirementsDto)
    project?: NotificationTypeProjectRequirementsDto;
}

/**
 * 알림 타입 응답 DTO
 */
export class NotificationTypeResponseDto {
    @ApiProperty({
        enum: NotificationType,
        description: '알림 타입',
        example: NotificationType.RESERVATION_STATUS_CONFIRMED,
    })
    @IsEnum(NotificationType)
    notificationType: NotificationType;

    @ApiProperty({
        type: NotificationTypeRequirementsDto,
        description: '알림 발송 시 필요한 정보 요구사항',
    })
    @ValidateNested()
    @Type(() => NotificationTypeRequirementsDto)
    requirements: NotificationTypeRequirementsDto;

    @ApiPropertyOptional({
        description: '알림 타입 설명',
        example: '예약이 확정되었을 때 발송되는 알림',
    })
    @IsOptional()
    @IsString()
    description?: string;
}
