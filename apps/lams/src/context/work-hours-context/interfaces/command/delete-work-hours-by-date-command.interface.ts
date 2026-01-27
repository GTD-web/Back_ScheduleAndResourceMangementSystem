/**
 * 날짜별 시수 삭제 Command 인터페이스
 */
export interface IDeleteWorkHoursByDateCommand {
    date: string;
    performedBy: string;
}
