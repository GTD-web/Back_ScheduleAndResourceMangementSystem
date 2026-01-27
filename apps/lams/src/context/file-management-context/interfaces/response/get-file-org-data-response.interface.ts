/**
 * 파일 orgData 조회 응답 인터페이스
 */
export interface IGetFileOrgDataResponse {
    fileId: string;
    orgData: Record<string, any> | null;
}
