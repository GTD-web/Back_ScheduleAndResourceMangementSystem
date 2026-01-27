/**
 * 휴일 목록 조회 Query 인터페이스
 */
export interface IGetHolidayListQuery {
    /**
     * 연도 (선택사항)
     * 제공되면 해당 연도의 휴일만 조회합니다.
     */
    year?: string;
}
