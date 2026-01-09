import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GenerateMonthlySummariesCommand } from './generate-monthly-summaries.command';
import { IGenerateMonthlySummariesResponse } from '../../../interfaces';
import { DomainMonthlyEventSummaryService } from '../../../../../domain/monthly-event-summary/monthly-event-summary.service';
import { DomainDailyEventSummaryService } from '../../../../../domain/daily-event-summary/daily-event-summary.service';

/**
 * 월간 요약 생성 핸들러
 *
 * flow.md의 "파일내용 반영 후 처리" 흐름 중 월간 요약 생성 부분을 구현합니다.
 *
 * 선택된 연도-월 에 대한 daily-event-summary 정보들을 가져와서 monthly-event-summary를 생성한다
 */
@CommandHandler(GenerateMonthlySummariesCommand)
export class GenerateMonthlySummariesHandler implements ICommandHandler<
    GenerateMonthlySummariesCommand,
    IGenerateMonthlySummariesResponse
> {
    private readonly logger = new Logger(GenerateMonthlySummariesHandler.name);

    constructor(
        private readonly monthlyEventSummaryService: DomainMonthlyEventSummaryService,
        private readonly dailyEventSummaryService: DomainDailyEventSummaryService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: GenerateMonthlySummariesCommand): Promise<IGenerateMonthlySummariesResponse> {
        const { employeeIds, year, month, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`월간 요약 생성 시작: year=${year}, month=${month}, 직원 수=${employeeIds.length}`);

                // TODO: flow.md의 흐름에 따라 구현
                // 1. 선택된 연도-월에 대한 daily-event-summary 정보들을 가져오기
                // 2. monthly-event-summary 생성

                this.logger.log(`✅ 월간 요약 생성 완료`);

                return {
                    success: true,
                    statistics: {
                        monthlyEventSummaryCount: 0,
                    },
                };
            } catch (error) {
                this.logger.error(`월간 요약 생성 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
}
