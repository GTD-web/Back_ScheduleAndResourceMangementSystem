import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateWorkTimeOverrideCommand } from './update-work-time-override.command';
import { IUpdateWorkTimeOverrideResponse } from '../../../interfaces/response/update-work-time-override-response.interface';
import { DomainWorkTimeOverrideService } from '../../../../../domain/work-time-override/work-time-override.service';

/**
 * 특별근태시간 수정 Handler
 */
@CommandHandler(UpdateWorkTimeOverrideCommand)
export class UpdateWorkTimeOverrideHandler
    implements ICommandHandler<UpdateWorkTimeOverrideCommand, IUpdateWorkTimeOverrideResponse>
{
    private readonly logger = new Logger(UpdateWorkTimeOverrideHandler.name);

    constructor(
        private readonly workTimeOverrideService: DomainWorkTimeOverrideService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: UpdateWorkTimeOverrideCommand): Promise<IUpdateWorkTimeOverrideResponse> {
        const { id, startWorkTime, endWorkTime, reason, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`특별근태시간 수정 시작: id=${id}`);

                const workTimeOverride = await this.workTimeOverrideService.수정한다(
                    id,
                    {
                        startWorkTime,
                        endWorkTime,
                        reason,
                    },
                    performedBy,
                    manager,
                );

                this.logger.log(`특별근태시간 수정 완료: workTimeOverrideId=${workTimeOverride.id}`);

                return {
                    workTimeOverride,
                };
            } catch (error) {
                this.logger.error(`특별근태시간 수정 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
}
