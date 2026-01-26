import { IProcessFileContentCommand } from '../../../interfaces';

/**
 * 파일 내용 가공 커맨드
 */
export class ProcessFileContentCommand {
    constructor(public readonly data: IProcessFileContentCommand) {}
}
