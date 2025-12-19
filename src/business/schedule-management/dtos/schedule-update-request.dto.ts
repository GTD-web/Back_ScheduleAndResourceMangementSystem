import { ScheduleType } from '../../../../libs/enums/schedule-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsDateString,
    IsBoolean,
    IsArray,
    IsInt,
    Min,
    MaxLength,
    IsObject,
    IsEnum,
    IsUUID,
} from 'class-validator';

export class ScheduleUpdateDateDto {
    @ApiProperty({
        description: '시작 날짜 및 시간',
        example: '2025-08-25T10:00:00Z',
        required: true,
    })
    @IsDateString()
    startDate: string;

    @ApiProperty({
        description: '종료 날짜 및 시간',
        example: '2025-08-25T11:00:00Z',
        required: true,
    })
    @IsDateString()
    endDate: string;
}

export class ScheduleUpdateInfoDto {
    @ApiProperty({
        description: '일정 제목',
        example: '수정된 주간 팀 회의',
        required: false,
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100, { message: '제목은 100자를 초과할 수 없습니다.' })
    title?: string;

    @ApiProperty({
        description: '일정 설명',
        example: '수정된 회의 설명입니다.',
        required: false,
        maxLength: 1000,
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: '설명은 1000자를 초과할 수 없습니다.' })
    description?: string;

    @ApiProperty({
        description: '시작 전 알림 여부',
        type: Boolean,
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    notifyBeforeStart?: boolean;

    @ApiProperty({
        description: '시작 전 알림 시간 (분)',
        type: [Number],
        example: [10, 30],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Min(1, { each: true })
    notifyMinutesBeforeStart?: number[];

    @ApiProperty({
        description: '위치',
        type: String,
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({
        description: '일정 타입',
        example: ScheduleType.PERSONAL,
        required: false,
    })
    @IsOptional()
    @IsEnum(ScheduleType)
    scheduleType: ScheduleType;

    @ApiProperty({
        description: '일정 부서',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsString()
    scheduleDepartment?: string;

    @ApiProperty({
        description: '프로젝트 ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsString()
    projectId?: string;

    @ApiProperty({
        description: '참여자',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    participants?: string[];

    @ApiProperty({
        description: '부서 ID 목록 (여러 부서 선택 가능)',
        example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-a12b-34c5-d678-901234567890'],
        required: false,
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    departmentIds?: string[];
}

export class ScheduleUpdateResourceDto {
    @ApiProperty({
        description: '자원 ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: true,
    })
    @IsString()
    resourceId: string;
}

/**
 * 일정 수정 요청 DTO
 */
export class ScheduleUpdateRequestDto {
    @ApiPropertyOptional({
        description: '날짜 정보',
        type: ScheduleUpdateDateDto,
        example: {
            startDate: '2025-08-25T10:00:00Z',
            endDate: '2025-08-25T11:00:00Z',
        },
    })
    date?: ScheduleUpdateDateDto;

    @ApiPropertyOptional({
        description: '정보 정보',
        type: ScheduleUpdateInfoDto,
        example: {
            title: '수정된 주간 팀 회의',
            description: '수정된 회의 설명입니다.',
            notifyBeforeStart: true,
            notifyMinutesBeforeStart: [10, 30],
            location: '11층 or 수지구 동천동',
            scheduleType: ScheduleType.PERSONAL,
            scheduleDepartment: '123e4567-e89b-12d3-a456-426614174000',
            projectId: '123e4567-e89b-12d3-a456-426614174000',
            participants: ['123e4567-e89b-12d3-a456-426614174000'],
            departmentIds: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-a12b-34c5-d678-901234567890'],
        },
    })
    info?: ScheduleUpdateInfoDto;

    @ApiPropertyOptional({
        description: '자원 정보',
        type: ScheduleUpdateResourceDto,
        example: {
            resourceId: '123e4567-e89b-12d3-a456-426614174000',
        },
    })
    resource?: ScheduleUpdateResourceDto;
}
