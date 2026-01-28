import { ApiProperty } from '@nestjs/swagger';
import { DailyEventSummaryWithHistoryDto } from './get-monthly-summaries.dto';

/**
 * 일간 요약 상세 조회 응답 DTO
 */
export class GetDailySummaryDetailResponseDto {
    @ApiProperty({ description: '일간 요약 상세 정보 (수정이력 및 근태 이슈 포함)', type: DailyEventSummaryWithHistoryDto })
    dailySummary: DailyEventSummaryWithHistoryDto;
}
