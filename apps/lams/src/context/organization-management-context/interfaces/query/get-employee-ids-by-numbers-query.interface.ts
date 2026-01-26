/**
 * 직원 번호 목록으로 직원 ID 목록 조회 Query 인터페이스
 */
export interface IGetEmployeeIdsByNumbersQuery {
    employeeNumbers: string[];
}
