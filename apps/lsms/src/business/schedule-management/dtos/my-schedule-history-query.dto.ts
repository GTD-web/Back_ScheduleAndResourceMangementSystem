import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class MyScheduleHistoryQueryDto {
    @ApiProperty({
        description: '검색 키워드 (제목 또는 자원명)',
        required: false,
        example: '회의실',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    keyword?: string;

    @ApiProperty({
        description: '페이지 번호',
        required: false,
        example: 1,
        default: 1,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value) || 1)
    page?: number = 1;

    @ApiProperty({
        description: '페이지당 항목 수',
        required: false,
        example: 20,
        default: 20,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value) || 20)
    limit?: number = 20;
}
