/**
 * 파일 업로드 커맨드 인터페이스
 */
export interface IUploadFileCommand {
    file: Express.Multer.File;
    uploadBy: string;
    year?: string;
    month?: string;
}

