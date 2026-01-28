import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

/**
 * 월간 요약 노트 수정 요청 DTO
 */
export class UpdateMonthlySummaryNoteRequestDto {
    @ApiProperty({
        description: '메모',
        example: '입사일: 2026-01-15\n3회 지각',
        required: false,
    })
    @IsString()
    @IsOptional()
    note?: string;
}

/**
 * 월간 요약 노트 수정 응답 DTO
 */
export class UpdateMonthlySummaryNoteResponseDto {
    @ApiProperty({ description: '수정된 월간 요약 정보' })
    monthlySummary: {
        id: string;
        employeeNumber: string;
        employeeId: string;
        employeeName: string | null;
        yyyymm: string;
        note: string | null;
        additionalNote: string;
        workDaysCount: number;
        totalWorkableTime: number | null;
        totalWorkTime: number;
        avgWorkTimes: number;
        attendanceTypeCount: Record<string, number>;
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date;
        createdBy?: string;
        updatedBy?: string;
        version: number;
    };
}
