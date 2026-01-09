import { IReflectFileContentCommand } from '../../../interfaces';

/**
 * 파일 내용 반영 커맨드
 */
export class ReflectFileContentCommand {
    constructor(public readonly data: IReflectFileContentCommand) {}
}
