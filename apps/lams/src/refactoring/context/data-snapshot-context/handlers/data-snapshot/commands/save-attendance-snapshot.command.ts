import { ICommand } from '@nestjs/cqrs';
import { ISaveAttendanceSnapshotCommand } from '../../../interfaces';

/**
 * 근태 스냅샷 저장 Command
 */
export class SaveAttendanceSnapshotCommand implements ICommand {
    constructor(public readonly data: ISaveAttendanceSnapshotCommand) {}
}
