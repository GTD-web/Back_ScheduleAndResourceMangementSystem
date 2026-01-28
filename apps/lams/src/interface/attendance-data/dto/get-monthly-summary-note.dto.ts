import { ApiProperty } from '@nestjs/swagger';

/**
 * 월간 요약 노트 조회 응답 DTO
 */
export class GetMonthlySummaryNoteResponseDto {
    @ApiProperty({ description: '월간 요약 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ description: '메모', example: '입사일: 2026-01-15\n3회 지각', nullable: true })
    note: string | null;
}
