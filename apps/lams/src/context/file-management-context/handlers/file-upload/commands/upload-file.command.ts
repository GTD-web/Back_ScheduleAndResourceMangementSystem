import { IUploadFileCommand } from '../../../interfaces';

/**
 * 파일 업로드 커맨드
 */
export class UploadFileCommand {
    constructor(public readonly data: IUploadFileCommand) {}
}
