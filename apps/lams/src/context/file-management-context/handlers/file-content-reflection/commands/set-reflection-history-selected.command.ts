import { ISetReflectionHistorySelectedCommand } from '../../../interfaces';

/**
 * 반영이력 선택 상태 설정 커맨드
 */
export class SetReflectionHistorySelectedCommand {
    constructor(public readonly data: ISetReflectionHistorySelectedCommand) {}
}
