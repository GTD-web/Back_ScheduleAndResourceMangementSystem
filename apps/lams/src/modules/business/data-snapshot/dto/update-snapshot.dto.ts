import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateSnapshotDto {
    @ApiProperty({
        description: '스냅샷 이름',
        example: '2024년 11월 근태 스냅샷 (수정)',
        required: false,
    })
    @IsString()
    @IsOptional()
    snapshotName?: string;

    @ApiProperty({
        description: '스냅샷 설명',
        example: '2024년 11월 전 직원 근태 요약 (최종 승인)',
        required: false,
    })
    @IsString()
    @IsOptional()
    snapshotDescription?: string;
}

