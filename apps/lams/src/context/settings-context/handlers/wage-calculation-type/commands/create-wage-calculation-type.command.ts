import { ICommand } from '@nestjs/cqrs';
import { ICreateWageCalculationTypeCommand } from '../../../interfaces/command/create-wage-calculation-type-command.interface';

/**
 * 임금 계산 유형 생성 Command
 */
export class CreateWageCalculationTypeCommand implements ICommand {
    constructor(public readonly data: ICreateWageCalculationTypeCommand) {}
}
