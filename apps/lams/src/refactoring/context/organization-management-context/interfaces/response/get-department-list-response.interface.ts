/**
 * 부서 정보 (계층구조용)
 */
export interface IDepartmentNode {
    id: string;
    departmentCode: string;
    departmentName: string;
    parentDepartmentId: string | null;
    type: string;
    order: number;
    employeeCount: number;
    children: IDepartmentNode[];
}

/**
 * 부서 정보 (1차원 배열용)
 */
export interface IDepartmentInfo {
    id: string;
    departmentCode: string;
    departmentName: string;
    parentDepartmentId: string | null;
    type: string;
    order: number;
    employeeCount: number;
}

/**
 * 부서 목록 조회 응답 인터페이스
 */
export interface IGetDepartmentListResponse {
    hierarchy: IDepartmentNode[];
    flatList: IDepartmentInfo[];
    totalDepartments: number;
    totalEmployees: number;
}
