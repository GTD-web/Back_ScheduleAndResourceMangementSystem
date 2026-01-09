import { IGenerateDailySummariesCommand } from '../../../interfaces';

/**
 * 일일 요약 생성 커맨드
 */
export class GenerateDailySummariesCommand {
    constructor(public readonly data: IGenerateDailySummariesCommand) {}
}
