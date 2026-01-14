import { ICommand } from '@nestjs/cqrs';
import { IRestoreFromHistoryCommand } from '../../../interfaces';

/**
 * 이력으로 되돌리기 커맨드
 */
export class RestoreFromHistoryCommand implements ICommand {
    constructor(public readonly data: IRestoreFromHistoryCommand) {}
}
