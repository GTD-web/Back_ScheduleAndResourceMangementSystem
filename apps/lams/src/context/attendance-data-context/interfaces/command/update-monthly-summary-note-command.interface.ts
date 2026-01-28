/**
 * 월간 요약 노트 수정 Command 인터페이스
 */
export interface IUpdateMonthlySummaryNoteCommand {
    monthlySummaryId: string;
    note?: string;
    performedBy: string;
}
