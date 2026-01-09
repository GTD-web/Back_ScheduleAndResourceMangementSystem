import { IsString, IsOptional, IsEnum, IsBoolean, ValidateNested, IsArray, Length } from 'class-validator';
import { ResourceType } from '../../../../../libs/enums/resource-type.enum';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateVehicleInfoDto } from '../vehicle/create-vehicle-info.dto';
import { CreateMeetingRoomInfoDto } from '../meeting-room/create-meeting-room-info.dto';
import { CreateAccommodationInfoDto } from '../accommodation/create-accommodation-info.dto';
import { CreateEquipmentInfoDto } from '../equipment/create-equipment-info.dto';
import { ERROR_MESSAGE } from '../../../../../libs/constants/error-message';

export class CreateResourceGroupDto {
    @ApiProperty()
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('상위 자원 그룹 ID') })
    parentResourceGroupId: string;

    @ApiProperty({ enum: ResourceType })
    @IsEnum(ResourceType, { message: ERROR_MESSAGE.VALIDATION.IS_ENUM('자원 타입', Object.values(ResourceType)) })
    type: ResourceType;

    @ApiProperty()
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('제목') })
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('제목', 0, 100) })
    title: string;

    @ApiProperty({ required: false })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('설명') })
    @IsOptional()
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('설명', 0, 100) })
    description?: string;
}

export class CreateResourceManagerDto {
    @ApiProperty({ description: '직원 ID' })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('직원 ID') })
    employeeId: string;
}

export class ResourceLocation {
    @ApiProperty()
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('주소') })
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('주소', 0, 100) })
    address: string;

    @ApiProperty()
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('상세 주소') })
    @IsOptional()
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('상세 주소', 0, 100) })
    detailAddress?: string;
}

export class ResourceLocationURL {
    @ApiProperty({ required: false })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('Tmap URL') })
    @IsOptional()
    tmap?: string;

    @ApiProperty({ required: false })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('Navermap URL') })
    @IsOptional()
    navermap?: string;

    @ApiProperty({ required: false })
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('Kakaomap URL') })
    @IsOptional()
    kakaomap?: string;
}

export class CreateResourceDto {
    @ApiProperty()
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('자원 그룹 ID') })
    resourceGroupId: string;

    @ApiProperty()
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('이름') })
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('이름', 0, 100) })
    name: string;

    @ApiProperty()
    @IsString({ message: ERROR_MESSAGE.VALIDATION.IS_STRING('설명') })
    @IsOptional()
    @Length(0, 100, { message: ERROR_MESSAGE.VALIDATION.IS_LENGTH('설명', 0, 100) })
    description?: string;

    @ApiProperty({ type: ResourceLocation })
    @IsOptional()
    location?: ResourceLocation;

    @ApiProperty({ type: ResourceLocationURL })
    @IsOptional()
    locationURLs?: ResourceLocationURL;

    @ApiProperty({ type: [String], example: ['123e4567-e89b-12d3-a456-426614174000'] })
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('이미지 파일 ID') })
    @IsOptional()
    images?: string[];

    @ApiProperty()
    @IsBoolean({ message: ERROR_MESSAGE.VALIDATION.IS_BOOLEAN('참가자 변경 알림 여부') })
    notifyParticipantChange: boolean;

    @ApiProperty()
    @IsBoolean({ message: ERROR_MESSAGE.VALIDATION.IS_BOOLEAN('예약 변경 알림 여부') })
    notifyReservationChange: boolean;

    @ApiProperty({ enum: ResourceType })
    @IsEnum(ResourceType, { message: ERROR_MESSAGE.VALIDATION.IS_ENUM('자원 타입', Object.values(ResourceType)) })
    type: ResourceType;
}

export class CreateResourceInfoDto {
    @ApiProperty({ type: CreateResourceDto })
    @ValidateNested()
    @Type(() => CreateResourceDto)
    resource: CreateResourceDto;

    @ApiProperty({
        oneOf: [
            { $ref: getSchemaPath(CreateVehicleInfoDto) },
            { $ref: getSchemaPath(CreateMeetingRoomInfoDto) },
            { $ref: getSchemaPath(CreateAccommodationInfoDto) },
            { $ref: getSchemaPath(CreateEquipmentInfoDto) },
        ],
    })
    typeInfo: CreateVehicleInfoDto | CreateMeetingRoomInfoDto | CreateAccommodationInfoDto | CreateEquipmentInfoDto;

    @ApiProperty({ type: [CreateResourceManagerDto] })
    @IsArray({ message: ERROR_MESSAGE.VALIDATION.IS_ARRAY('관리자') })
    @ValidateNested({ each: true })
    @Type(() => CreateResourceManagerDto)
    managers: CreateResourceManagerDto[];
}
