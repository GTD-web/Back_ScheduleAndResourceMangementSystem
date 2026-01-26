/**
 * 파일 업로드 응답 인터페이스
 */
export interface IUploadFileResponse {
    fileId: string;
    fileName: string;
    filePath: string;
    year?: string;
    month?: string;
}
