/**
 * 해당 연월의 모든 부서 월간 요약 스냅샷 저장 Command 인터페이스
 *
 * 해당 연월에 월간 요약이 있는 모든 부서의 스냅샷을 저장합니다.
 */
export interface ISaveAllDepartmentsMonthlySnapshotCommand {
    year: string;
    month: string;
    performedBy: string;
}
