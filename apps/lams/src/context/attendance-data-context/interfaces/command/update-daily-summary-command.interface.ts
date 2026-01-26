/**
 * 일간 요약 수정 Command 인터페이스
 *
 * 출퇴근 시간 또는 근태유형 중 하나만 수정 가능합니다.
 * 근태유형은 최대 2개까지 설정 가능합니다 (오전/오후 근태 조합).
 */
export interface IUpdateDailySummaryCommand {
    dailySummaryId: string;
    enter?: string;
    leave?: string;
    attendanceTypeIds?: string[];
    reason: string;
    performedBy: string;
}
