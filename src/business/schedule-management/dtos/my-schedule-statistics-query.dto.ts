import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { ParticipantsType } from '../../../../libs/enums/reservation-type.enum';
import { ScheduleCategoryType } from './my-schedule-query.dto';

export class MyScheduleStatisticsQueryDto {
    @ApiProperty({
        description: '역할 기준 필터 (예약자, 참석자)',
        enum: ParticipantsType,
        required: false,
        example: ParticipantsType.RESERVER,
    })
    @IsOptional()
    @IsEnum(ParticipantsType)
    role?: ParticipantsType;

    @ApiProperty({
        description: '카테고리 필터 (전체, 일정, 프로젝트, 자원)',
        enum: ScheduleCategoryType,
        required: false,
        example: ScheduleCategoryType.ALL,
    })
    @IsOptional()
    @IsEnum(ScheduleCategoryType)
    category?: ScheduleCategoryType;
}
