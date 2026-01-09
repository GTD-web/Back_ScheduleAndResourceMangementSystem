import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class ScheduleDetailQueryDto {
    @ApiProperty({
        description: '일정 ID',
        example: 'uuid-string',
    })
    @IsString()
    @IsNotEmpty()
    scheduleId: string;

    @ApiProperty({
        description: '프로젝트 정보 포함 여부',
        required: false,
        example: true,
        default: false,
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    includeProject?: boolean = false;

    @ApiProperty({
        description: '자원예약 정보 포함 여부',
        required: false,
        example: true,
        default: false,
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    includeReservation?: boolean = false;
}
