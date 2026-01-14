import { ICommand } from '@nestjs/cqrs';
import { ISaveAllDepartmentsMonthlySnapshotCommand } from '../../../interfaces';

/**
 * 해당 연월의 모든 부서 월간 요약 스냅샷 저장 Command
 */
export class SaveAllDepartmentsMonthlySnapshotCommand implements ICommand {
    constructor(public readonly data: ISaveAllDepartmentsMonthlySnapshotCommand) {}
}
