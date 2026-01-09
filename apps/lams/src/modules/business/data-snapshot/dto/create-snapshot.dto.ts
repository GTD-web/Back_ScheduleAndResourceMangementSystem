import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsEnum, IsOptional } from 'class-validator';
import { SnapshotType } from '../../../domain/data-snapshot-info/data-snapshot-info.entity';

export class CreateSnapshotDto {
    @ApiProperty({
        description: '스냅샷 이름',
        example: '2024년 11월 근태 스냅샷',
    })
    @IsString()
    @IsNotEmpty()
    snapshotName: string;

    @ApiProperty({
        description: '스냅샷 설명',
        example: '2024년 11월 전 직원 근태 요약',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: '스냅샷 타입',
        enum: SnapshotType,
        example: SnapshotType.MONTHLY,
    })
    @IsEnum(SnapshotType)
    @IsNotEmpty()
    snapshotType: SnapshotType;

    @ApiProperty({
        description: '연도 (YYYY)',
        example: '2024',
    })
    @IsString()
    @IsNotEmpty()
    yyyy: string;

    @ApiProperty({
        description: '월 (MM)',
        example: '11',
    })
    @IsString()
    @IsNotEmpty()
    mm: string;

    @ApiProperty({
        description: '월간 요약 데이터 배열',
        type: 'array',
        items: { type: 'object' },
        example: [
            {
                monthlyEventSummaryId: 'uuid',
                employeeNumber: '24004',
                employeeId: 'uuid',
                employeeName: '홍길동',
                yyyymm: '2024-11',
                // ... 기타 MonthlyEventSummary 필드들
            },
        ],
    })
    @IsArray()
    @IsNotEmpty()
    monthlySummaries: any[];
}

