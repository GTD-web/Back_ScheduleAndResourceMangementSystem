import {
    IsString,
    IsOptional,
    IsBoolean,
    IsArray,
    ValidateNested,
    IsNumber,
    Min,
    Max,
    IsInt,
    Length,
} from 'class-validator';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateResourceManagerDto, ResourceLocation, ResourceLocationURL } from './create-resource.dto';
import { ERROR_MESSAGE } from '../../../../../libs/constants/error-message';
import { UpdateAccommodationInfoDto } from '../accommodation/update-accommodation-info.dto';
import { UpdateVehicleInfoDto } from '../vehicle/update-vehicle-info.dto';
import { UpdateMeetingRoomInfoDto } from '../meeting-room/update-meeting-room-info.dto';
import { UpdateEquipmentInfoDto } from '../equipment/update-equipment-info.dto';

export class UpdateResourceGroupDto {
    @ApiProperty({ required: false })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('제목') })
    @IsOptional()
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('제목', 0, 100) })
    title?: string;

    // @ApiProperty({ required: false })
    // @IsString()
    // @IsOptional()
    // description?: string;
}

export class UpdateResourceDto {
    @ApiProperty({ required: false })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('자원 그룹 ID') })
    @IsOptional()
    resourceGroupId?: string;

    @ApiProperty({ required: false })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('이름') })
    @IsOptional()
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('이름', 0, 100) })
    name?: string;

    @ApiProperty({ required: false })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('설명') })
    @IsOptional()
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('설명', 0, 100) })
    description?: string;

    @ApiProperty({ required: false, type: 'object' })
    @IsOptional()
    location?: ResourceLocation;

    @ApiProperty({ required: false, type: 'object' })
    @IsOptional()
    locationURLs?: ResourceLocationURL;

    @ApiProperty({ required: false, type: [String] })
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('이미지') })
    @IsOptional()
    images?: string[];

    @ApiProperty({ required: false })
    @IsBoolean({ message: ERROR_MESSAGE.VALIDATION.IS_BOOLEAN('사용 가능 여부') })
    @IsOptional()
    isAvailable?: boolean;

    @ApiProperty({ required: false })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('사용 불가 사유') })
    @IsOptional()
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('사용 불가 사유', 0, 100) })
    unavailableReason?: string;

    @ApiProperty({ required: false })
    @IsBoolean({ message: ERROR_MESSAGE.VALIDATION.IS_BOOLEAN('참가자 변경 알림 여부') })
    @IsOptional()
    notifyParticipantChange?: boolean;

    @ApiProperty({ required: false })
    @IsBoolean({ message: ERROR_MESSAGE.VALIDATION.IS_BOOLEAN('예약 변경 알림 여부') })
    @IsOptional()
    notifyReservationChange?: boolean;
}

export class UpdateResourceInfoDto {
    @ApiProperty({ required: false, type: UpdateResourceDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateResourceDto)
    resource?: UpdateResourceDto;

    @ApiProperty({
        required: false,
        oneOf: [
            { $ref: getSchemaPath(UpdateVehicleInfoDto) },
            { $ref: getSchemaPath(UpdateMeetingRoomInfoDto) },
            { $ref: getSchemaPath(UpdateAccommodationInfoDto) },
            { $ref: getSchemaPath(UpdateEquipmentInfoDto) },
        ],
    })
    @IsOptional()
    typeInfo?: UpdateVehicleInfoDto | UpdateMeetingRoomInfoDto | UpdateAccommodationInfoDto | UpdateEquipmentInfoDto;

    @ApiProperty({ required: false, type: [CreateResourceManagerDto] })
    @IsOptional()
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('관리자') })
    @ValidateNested({ each: true })
    @Type(() => CreateResourceManagerDto)
    managers?: CreateResourceManagerDto[];
}

export class NewOrderResourceDto {
    @ApiProperty()
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('자원 ID') })
    resourceId: string;

    @ApiProperty()
    @IsNumber({}, { message: ERROR_MESSAGE.VALIDATION.IS_NUMBER('순서') })
    newOrder: number;
}

export class UpdateResourceOrdersDto {
    @ApiProperty({ type: [NewOrderResourceDto] })
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('순서 목록') })
    orders: NewOrderResourceDto[];
}

export class NewOrderResourceGroupDto {
    @ApiProperty()
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('자원 그룹 ID') })
    resourceGroupId: string;

    @ApiProperty()
    @IsNumber({}, { message: ERROR_MESSAGE.VALIDATION.IS_NUMBER('순서') })
    newOrder: number;
}

export class UpdateResourceGroupOrdersDto {
    @ApiProperty({ type: [NewOrderResourceGroupDto] })
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('순서 목록') })
    orders: NewOrderResourceGroupDto[];
}
