import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateWorkTimeOverrideCommand } from './create-work-time-override.command';
import { ICreateWorkTimeOverrideResponse } from '../../../interfaces/response/create-work-time-override-response.interface';
import { DomainWorkTimeOverrideService } from '../../../../../domain/work-time-override/work-time-override.service';

/**
 * 특별근태시간 생성 Handler
 */
@CommandHandler(CreateWorkTimeOverrideCommand)
export class CreateWorkTimeOverrideHandler
    implements ICommandHandler<CreateWorkTimeOverrideCommand, ICreateWorkTimeOverrideResponse>
{
    private readonly logger = new Logger(CreateWorkTimeOverrideHandler.name);

    constructor(
        private readonly workTimeOverrideService: DomainWorkTimeOverrideService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: CreateWorkTimeOverrideCommand): Promise<ICreateWorkTimeOverrideResponse> {
        const { date, startWorkTime, endWorkTime, reason, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`특별근태시간 생성 시작: date=${date}`);

                const workTimeOverride = await this.workTimeOverrideService.생성한다(
                    {
                        date,
                        startWorkTime,
                        endWorkTime,
                        reason,
                    },
                    performedBy,
                    manager,
                );

                this.logger.log(`특별근태시간 생성 완료: workTimeOverrideId=${workTimeOverride.id}`);

                return {
                    workTimeOverride,
                };
            } catch (error) {
                this.logger.error(`특별근태시간 생성 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
}
