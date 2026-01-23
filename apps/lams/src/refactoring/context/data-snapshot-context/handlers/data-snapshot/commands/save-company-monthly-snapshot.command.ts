import { ICommand } from '@nestjs/cqrs';
import { ISaveCompanyMonthlySnapshotCommand } from '../../../interfaces';

/**
 * 회사 전체 월간 요약 스냅샷 저장 Command
 */
export class SaveCompanyMonthlySnapshotCommand implements ICommand {
    constructor(public readonly data: ISaveCompanyMonthlySnapshotCommand) {}
}
