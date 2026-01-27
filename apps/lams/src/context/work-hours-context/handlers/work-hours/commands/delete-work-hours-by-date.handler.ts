import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { DeleteWorkHoursByDateCommand } from './delete-work-hours-by-date.command';
import { DomainWorkHoursService } from '../../../../../domain/work-hours/work-hours.service';
import { WorkHours } from '../../../../../domain/work-hours/work-hours.entity';

/**
 * 날짜별 시수 삭제 Handler
 */
@CommandHandler(DeleteWorkHoursByDateCommand)
export class DeleteWorkHoursByDateHandler
    implements ICommandHandler<DeleteWorkHoursByDateCommand, void>
{
    private readonly logger = new Logger(DeleteWorkHoursByDateHandler.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly workHoursService: DomainWorkHoursService,
    ) {}

    async execute(command: DeleteWorkHoursByDateCommand): Promise<void> {
        const { date, performedBy } = command.data;

        this.logger.log(`날짜별 시수 삭제 시작: date=${date}`);

        await this.dataSource.transaction(async (manager) => {
            // 해당 날짜의 모든 시수를 조회
            const repository = manager.getRepository(WorkHours);
            const workHoursList = await repository.find({
                where: {
                    date,
                    deleted_at: IsNull(),
                },
            });

            // 각 시수를 삭제
            for (const workHours of workHoursList) {
                await this.workHoursService.완전삭제한다(workHours.id, performedBy, manager);
            }
        });

        this.logger.log(`날짜별 시수 삭제 완료: date=${date}`);
    }
}
