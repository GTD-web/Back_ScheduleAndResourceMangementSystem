import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateMonthlySummaryNoteCommand } from './update-monthly-summary-note.command';
import { IUpdateMonthlySummaryNoteResponse } from '../../../interfaces/response/update-monthly-summary-note-response.interface';
import { DomainMonthlyEventSummaryService } from '../../../../../domain/monthly-event-summary/monthly-event-summary.service';
import { MonthlyEventSummary } from '../../../../../domain/monthly-event-summary/monthly-event-summary.entity';

/**
 * 월간 요약 노트 수정 Command Handler
 */
@CommandHandler(UpdateMonthlySummaryNoteCommand)
export class UpdateMonthlySummaryNoteHandler implements ICommandHandler<
    UpdateMonthlySummaryNoteCommand,
    IUpdateMonthlySummaryNoteResponse
> {
    private readonly logger = new Logger(UpdateMonthlySummaryNoteHandler.name);

    constructor(
        private readonly monthlyEventSummaryService: DomainMonthlyEventSummaryService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: UpdateMonthlySummaryNoteCommand): Promise<IUpdateMonthlySummaryNoteResponse> {
        const { monthlySummaryId, note, performedBy } = command.data;

        this.logger.log(`월간 요약 노트 수정 시작: monthlySummaryId=${monthlySummaryId}`);

        return await this.dataSource.transaction(async (manager) => {
            // 1. 월간 요약 조회
            const monthlySummary = await manager.findOne(MonthlyEventSummary, {
                where: { id: monthlySummaryId },
            });

            if (!monthlySummary) {
                throw new NotFoundException(`월간 요약을 찾을 수 없습니다. (id: ${monthlySummaryId})`);
            }

            // 2. 노트 업데이트
            monthlySummary.업데이트한다(
                undefined, // employee_number
                undefined, // employee_name
                undefined, // work_days_count
                undefined, // total_workable_time
                undefined, // total_work_time
                undefined, // avg_work_times
                undefined, // attendance_type_count
                undefined, // weekly_work_time_summary
                undefined, // daily_event_summary
                undefined, // late_details
                undefined, // absence_details
                undefined, // early_leave_details
                note ?? undefined, // note
                undefined, // additional_note
            );

            monthlySummary.수정자설정한다(performedBy);
            monthlySummary.메타데이터업데이트한다(performedBy);

            // 3. 저장
            const updatedSummary = await manager.save(MonthlyEventSummary, monthlySummary);

            this.logger.log(`월간 요약 노트 수정 완료: monthlySummaryId=${monthlySummaryId}`);

            return {
                monthlySummary: updatedSummary.DTO변환한다(),
            };
        });
    }
}
