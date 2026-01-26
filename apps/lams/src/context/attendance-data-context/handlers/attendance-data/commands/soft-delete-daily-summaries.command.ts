import { ISoftDeleteDailySummariesCommand } from '../../../interfaces';

/**
 * 일일요약 소프트 삭제 커맨드
 */
export class SoftDeleteDailySummariesCommand {
    constructor(public readonly data: ISoftDeleteDailySummariesCommand) {}
}
