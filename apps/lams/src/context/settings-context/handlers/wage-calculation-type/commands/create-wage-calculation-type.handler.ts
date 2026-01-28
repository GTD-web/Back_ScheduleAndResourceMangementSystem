import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateWageCalculationTypeCommand } from './create-wage-calculation-type.command';
import { ICreateWageCalculationTypeResponse } from '../../../interfaces/response/create-wage-calculation-type-response.interface';
import { DomainWageCalculationTypeService } from '../../../../../domain/wage-calculation-type/wage-calculation-type.service';

/**
 * 임금 계산 유형 생성 Handler
 */
@CommandHandler(CreateWageCalculationTypeCommand)
export class CreateWageCalculationTypeHandler
    implements ICommandHandler<CreateWageCalculationTypeCommand, ICreateWageCalculationTypeResponse>
{
    private readonly logger = new Logger(CreateWageCalculationTypeHandler.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly wageCalculationTypeService: DomainWageCalculationTypeService,
    ) {}

    async execute(command: CreateWageCalculationTypeCommand): Promise<ICreateWageCalculationTypeResponse> {
        const { calculationType, startDate, changedAt, isCurrentlyApplied, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`임금 계산 유형 생성 시작: calculationType=${calculationType}, startDate=${startDate}`);

                const wageCalculationType = await this.wageCalculationTypeService.생성한다(
                    {
                        calculationType,
                        startDate,
                        changedAt,
                        isCurrentlyApplied,
                    },
                    performedBy,
                    manager,
                );

                this.logger.log(`임금 계산 유형 생성 완료: wageCalculationTypeId=${wageCalculationType.id}`);

                return {
                    wageCalculationType,
                };
            } catch (error) {
                this.logger.error(`임금 계산 유형 생성 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
}
