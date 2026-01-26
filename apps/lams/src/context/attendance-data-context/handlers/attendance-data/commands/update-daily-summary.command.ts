import { ICommand } from '@nestjs/cqrs';
import { IUpdateDailySummaryCommand } from '../../../interfaces/command/update-daily-summary-command.interface';

/**
 * 일간 요약 수정 Command
 */
export class UpdateDailySummaryCommand implements ICommand {
    constructor(public readonly data: IUpdateDailySummaryCommand) {}
}
