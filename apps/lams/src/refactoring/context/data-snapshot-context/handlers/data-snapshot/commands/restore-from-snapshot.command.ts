import { ICommand } from '@nestjs/cqrs';
import { IRestoreFromSnapshotCommand } from '../../../interfaces';

/**
 * 스냅샷으로부터 복원 Command
 */
export class RestoreFromSnapshotCommand implements ICommand {
    constructor(public readonly data: IRestoreFromSnapshotCommand) {}
}
