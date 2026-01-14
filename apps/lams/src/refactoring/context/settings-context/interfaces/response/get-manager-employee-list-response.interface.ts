/**
 * 직원 정보
 */
export interface IEmployeeInfo {
    id: string;
    employeeNumber: string;
    employeeName: string;
}

/**
 * 관리자 직원 목록 조회 응답 인터페이스
 */
export interface IGetManagerEmployeeListResponse {
    employees: IEmployeeInfo[];
    totalCount: number;
}
