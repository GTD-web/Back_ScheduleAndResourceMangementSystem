import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsArray, IsDateString, IsEnum, Matches, Length } from 'class-validator';
import { ResourceType } from '../../../../libs/enums/resource-type.enum';
import { ERROR_MESSAGE } from '../../../../libs/constants/error-message';
import { ReservationStatus } from '../../../../libs/enums/reservation-type.enum';

export class CreateReservationDto {
    @ApiProperty()
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('자원 ID') })
    resourceId: string;

    @ApiProperty({ enum: ResourceType })
    @IsEnum(ResourceType, { message: ERROR_MESSAGE.VALIDATION.IS_ENUM('자원 타입', Object.values(ResourceType)) })
    resourceType: ResourceType;

    @ApiProperty()
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('제목') })
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('제목', 0, 100) })
    title: string;

    @ApiProperty({ required: false })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('설명') })
    @IsOptional()
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('설명', 0, 100) })
    description?: string;

    @ApiProperty({
        example: '2025-01-01 00:00:00',
        description: '예약 시작 시간 (YYYY-MM-DD HH:mm:ss 형식)',
    })
    @IsDateString()
    @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
        message: ERROR_MESSAGE.VALIDATION.INVALID_DATE_FORMAT('시작 시간', 'YYYY-MM-DD HH:mm:ss'),
    })
    startDate: string;

    @ApiProperty({
        example: '2025-01-01 00:00:00',
        description: '예약 종료 시간 (YYYY-MM-DD HH:mm:ss 형식)',
    })
    @IsDateString()
    @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
        message: ERROR_MESSAGE.VALIDATION.INVALID_DATE_FORMAT('종료 시간', 'YYYY-MM-DD HH:mm:ss'),
    })
    endDate: string;

    @ApiProperty({ example: false })
    @IsBoolean({ message: ERROR_MESSAGE.VALIDATION.IS_BOOLEAN('종일 여부') })
    isAllDay: boolean;

    @ApiProperty({ example: false })
    @IsBoolean({ message: ERROR_MESSAGE.VALIDATION.IS_BOOLEAN('시작 전 알림 여부') })
    notifyBeforeStart: boolean;

    @ApiProperty({ required: false, enum: ReservationStatus })
    status?: ReservationStatus;

    @ApiProperty({ required: false, type: [Number], example: [10, 20] })
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('알림 시간') })
    @IsOptional()
    notifyMinutesBeforeStart?: number[];

    // @ApiProperty({ type: [String] })
    // @IsArray()
    // @IsString({ each: true })
    // reserverIds: string[];

    @ApiProperty({ type: [String] })
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('참가자 ID') })
    @IsString({ each: true, message: ERROR_MESSAGE.VALIDATION.INVALID_ARRAY_ITEM_TYPE('참가자 ID', '문자열') })
    participantIds: string[];

    // @ApiProperty({ type: [String] })
    // @IsArray()
    // @IsString({ each: true })
    // ccReceipientIds: string[];
}
