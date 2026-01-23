import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SoftDeleteDailySummariesCommand } from './soft-delete-daily-summaries.command';
import { DailyEventSummary } from '../../../../../domain/daily-event-summary/daily-event-summary.entity';
import { AttendanceIssue } from '../../../../../domain/attendance-issue/attendance-issue.entity';
import { DailySummaryChangeHistory } from '../../../../../domain/daily-summary-change-history/daily-summary-change-history.entity';
import { format, startOfMonth, endOfMonth } from 'date-fns';

/**
 * 일일요약 소프트 삭제 핸들러
 *
 * 해당 연월의 모든 일간요약을 소프트 삭제합니다.
 * 재반영 시 이전 데이터를 제거하기 위해 사용됩니다.
 */
@CommandHandler(SoftDeleteDailySummariesCommand)
export class SoftDeleteDailySummariesHandler implements ICommandHandler<SoftDeleteDailySummariesCommand, void> {
    private readonly logger = new Logger(SoftDeleteDailySummariesHandler.name);

    constructor(private readonly dataSource: DataSource) {}

    async execute(command: SoftDeleteDailySummariesCommand): Promise<void> {
        const { year, month, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            // 날짜 범위 계산
            const yearNum = parseInt(year);
            const monthNum = parseInt(month);
            const startDate = startOfMonth(new Date(yearNum, monthNum - 1, 1));
            const endDate = endOfMonth(new Date(yearNum, monthNum - 1, 1));
            const startDateStr = format(startDate, 'yyyy-MM-dd');
            const endDateStr = format(endDate, 'yyyy-MM-dd');

            await this.해당연월일간요약소프트삭제(startDateStr, endDateStr, performedBy, manager);
        });
    }

    /**
     * 해당 연월의 모든 일간요약을 소프트 삭제한다
     *
     * 재반영 시 이전 데이터를 제거하기 위해 사용됩니다.
     * 조회된 직원 목록과 이전에 적용되어 있던 직원 목록이 달라질 수 있기 때문에
     * 해당 연월의 모든 요약 데이터를 소프트 삭제한 후 새로 생성합니다.
     *
     * @param startDate 시작 날짜 (yyyy-MM-dd)
     * @param endDate 종료 날짜 (yyyy-MM-dd)
     * @param performedBy 수행자 ID
     * @param manager EntityManager
     */
    private async 해당연월일간요약소프트삭제(
        startDate: string,
        endDate: string,
        performedBy: string,
        manager: any,
    ): Promise<void> {
        const existingSummaries = await manager
            .createQueryBuilder(DailyEventSummary, 'des')
            .where('des.deleted_at IS NULL')
            .andWhere('des.date >= :startDate', { startDate })
            .andWhere('des.date <= :endDate', { endDate })
            .getMany();

        if (existingSummaries.length === 0) {
            return;
        }

        const summaryIds = existingSummaries.map((s) => s.id);
        const now = new Date();

        // 1. 일간 요약 소프트 삭제
        for (const summary of existingSummaries) {
            summary.deleted_at = now;
            summary.수정자설정한다(performedBy);
            summary.메타데이터업데이트한다(performedBy);
        }
        await manager.save(DailyEventSummary, existingSummaries);

        // 2. 해당 일간 요약과 연결된 근태 이슈 소프트 삭제
        const existingIssues = await manager
            .createQueryBuilder(AttendanceIssue, 'ai')
            .where('ai.deleted_at IS NULL')
            .andWhere('ai.daily_event_summary_id IN (:...summaryIds)', { summaryIds })
            .getMany();

        if (existingIssues.length > 0) {
            for (const issue of existingIssues) {
                issue.deleted_at = now;
                issue.수정자설정한다(performedBy);
                issue.메타데이터업데이트한다(performedBy);
            }
            await manager.save(AttendanceIssue, existingIssues);
        }

        // 3. 해당 일간 요약과 연결된 변경 이력 소프트 삭제
        const existingHistories = await manager
            .createQueryBuilder(DailySummaryChangeHistory, 'dsh')
            .where('dsh.deleted_at IS NULL')
            .andWhere('dsh.daily_event_summary_id IN (:...summaryIds)', { summaryIds })
            .getMany();

        if (existingHistories.length > 0) {
            for (const history of existingHistories) {
                history.deleted_at = now;
                history.수정자설정한다(performedBy);
                history.메타데이터업데이트한다(performedBy);
            }
            await manager.save(DailySummaryChangeHistory, existingHistories);
        }

        this.logger.log(
            `해당 연월 일간요약 소프트 삭제 완료: 일간요약=${existingSummaries.length}건, 이슈=${existingIssues.length}건, 변경이력=${existingHistories.length}건`,
        );
    }
}
