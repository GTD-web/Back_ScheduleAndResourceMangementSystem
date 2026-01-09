import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ResourceType } from '../../../../libs/enums/resource-type.enum';

export class ResourceScheduleQueryDto {
    @ApiProperty({
        description: '자원 유형',
        enum: ResourceType,
        example: ResourceType.MEETING_ROOM,
    })
    @IsEnum(ResourceType)
    resourceType: ResourceType;

    @ApiProperty({
        description: '조회 날짜 (일별 검색용 - YYYY-MM-DD 형식)',
        required: false,
        example: '2024-01-15',
    })
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiProperty({
        description: '조회 월 (월별 검색용 - YYYY-MM 형식, 숙소 전용)',
        required: false,
        example: '2024-01',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    month?: string;
}
