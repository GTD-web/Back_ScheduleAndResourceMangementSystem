import { ISoftDeleteMonthlySummariesCommand } from '../../../interfaces';

/**
 * 월간요약 소프트 삭제 커맨드
 */
export class SoftDeleteMonthlySummariesCommand {
    constructor(public readonly data: ISoftDeleteMonthlySummariesCommand) {}
}
