import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SoftDeleteMonthlySummariesCommand } from './soft-delete-monthly-summaries.command';
import { MonthlyEventSummary } from '../../../../../domain/monthly-event-summary/monthly-event-summary.entity';

/**
 * 월간요약 소프트 삭제 핸들러
 *
 * 해당 연월의 모든 월간요약을 소프트 삭제합니다.
 * 재반영 시 이전 데이터를 제거하기 위해 사용됩니다.
 */
@CommandHandler(SoftDeleteMonthlySummariesCommand)
export class SoftDeleteMonthlySummariesHandler implements ICommandHandler<SoftDeleteMonthlySummariesCommand, void> {
    private readonly logger = new Logger(SoftDeleteMonthlySummariesHandler.name);

    constructor(private readonly dataSource: DataSource) {}

    async execute(command: SoftDeleteMonthlySummariesCommand): Promise<void> {
        const { year, month, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            const yyyymm = `${year}-${month.padStart(2, '0')}`;
            await this.해당연월월간요약소프트삭제(yyyymm, performedBy, manager);
        });
    }

    /**
     * 해당 연월의 모든 월간 요약을 소프트 삭제한다
     *
     * @param yyyymm 연월 (YYYY-MM 형식)
     * @param performedBy 수행자 ID
     * @param manager EntityManager
     */
    private async 해당연월월간요약소프트삭제(yyyymm: string, performedBy: string, manager: any): Promise<void> {
        const existingSummaries = await manager
            .createQueryBuilder(MonthlyEventSummary, 'mes')
            .where('mes.yyyymm = :yyyymm', { yyyymm })
            .withDeleted()
            .getMany();

        if (existingSummaries.length === 0) {
            return;
        }

        const now = new Date();
        for (const summary of existingSummaries) {
            summary.deleted_at = now;
            summary.수정자설정한다(performedBy);
            summary.메타데이터업데이트한다(performedBy);
        }

        await manager.save(MonthlyEventSummary, existingSummaries);
        this.logger.log(`해당 연월 월간요약 소프트 삭제 완료: ${existingSummaries.length}건 (yyyymm=${yyyymm})`);
    }
}
