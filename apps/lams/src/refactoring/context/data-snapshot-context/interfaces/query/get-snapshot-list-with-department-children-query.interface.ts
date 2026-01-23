/**
 * 부서 기준 스냅샷 목록 조회 Query 인터페이스
 *
 * 스냅샷 목록은 연월 기준으로 조회하되, 자식 정보는 특정 부서 소속 직원만 반환한다.
 */
export interface IGetSnapshotListWithDepartmentChildrenQuery {
    year: string;
    month: string;
    departmentId: string;
    /**
     * 정렬 기준 (기본값: 'latest' - 최신순)
     */
    sortBy?: 'latest' | 'oldest' | 'name' | 'type';
    /**
     * 필터 조건 (향후 확장 가능)
     */
    filters?: {
        snapshotType?: string;
        dateRange?: {
            startDate?: string;
            endDate?: string;
        };
    };
}
