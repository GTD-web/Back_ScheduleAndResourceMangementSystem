import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ScheduleCategoryType } from './my-schedule-query.dto';

export class ScheduleCalendarQueryDto {
    @ApiProperty({
        description: '조회할 날짜 (YYYY-MM 형식)',
        example: '2024-01',
        required: true,
    })
    @IsString()
    date: string;

    @ApiProperty({
        description: '카테고리 필터 (전체, 일정, 프로젝트, 자원)',
        enum: ScheduleCategoryType,
        example: ScheduleCategoryType.ALL,
        required: false,
    })
    @IsOptional()
    @IsEnum(ScheduleCategoryType)
    category?: ScheduleCategoryType;

    @ApiProperty({
        description: '내 일정만 조회 여부',
        example: false,
        required: false,
        type: Boolean,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return Boolean(value);
    })
    @IsBoolean()
    mySchedule?: boolean;

    @ApiProperty({
        description: '특정 직원들의 일정만 조회 (직원 ID 배열)',
        example: ['emp-001', 'emp-002', 'emp-003'],
        required: false,
        type: [String],
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (Array.isArray(value)) {
            return value;
        }
        return value ? [value] : [];
    })
    @IsArray()
    @IsString({ each: true })
    employeeIds?: string[];

    @ApiProperty({
        description: '프로젝트 ID 배열',
        example: ['proj-001', 'proj-002', 'proj-003'],
        required: false,
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    projectIds?: string[];
}
