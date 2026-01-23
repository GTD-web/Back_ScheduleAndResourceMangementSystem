import { ISaveReflectedDataCommand } from '../../../interfaces';

/**
 * 반영 데이터 저장 커맨드
 */
export class SaveReflectedDataCommand {
    constructor(public readonly data: ISaveReflectedDataCommand) {}
}
