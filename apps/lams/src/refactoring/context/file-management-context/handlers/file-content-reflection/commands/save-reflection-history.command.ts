import { ISaveReflectionHistoryCommand } from '../../../interfaces';

/**
 * 파일 내용 반영 이력 저장 커맨드
 */
export class SaveReflectionHistoryCommand {
    constructor(public readonly data: ISaveReflectionHistoryCommand) {}
}
