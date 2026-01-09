import { IGenerateMonthlySummariesCommand } from '../../../interfaces';

/**
 * 월간 요약 생성 커맨드
 */
export class GenerateMonthlySummariesCommand {
    constructor(public readonly data: IGenerateMonthlySummariesCommand) {}
}
