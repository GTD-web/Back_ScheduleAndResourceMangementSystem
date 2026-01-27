/**
 * 프로젝트 목록 조회 응답 인터페이스
 */
export interface IGetProjectListResponse {
    projects: Array<{
        id: string;
        projectCode: string;
        projectName: string;
        description: string | null;
        isActive: boolean;
    }>;
    totalCount: number;
}
