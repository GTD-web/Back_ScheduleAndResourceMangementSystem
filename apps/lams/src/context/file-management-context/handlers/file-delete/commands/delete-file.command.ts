import { ICommand } from '@nestjs/cqrs';

/**
 * 파일 삭제 Command 인터페이스
 */
export interface IDeleteFileCommand {
    fileId: string;
    userId: string;
}

/**
 * 파일 삭제 Command
 */
export class DeleteFileCommand implements ICommand {
    constructor(public readonly data: IDeleteFileCommand) {}
}
