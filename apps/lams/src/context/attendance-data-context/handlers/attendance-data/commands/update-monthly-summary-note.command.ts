import { ICommand } from '@nestjs/cqrs';
import { IUpdateMonthlySummaryNoteCommand } from '../../../interfaces/command/update-monthly-summary-note-command.interface';

/**
 * 월간 요약 노트 수정 Command
 */
export class UpdateMonthlySummaryNoteCommand implements ICommand {
    constructor(public readonly data: IUpdateMonthlySummaryNoteCommand) {}
}
