import { IDeleteExistingDataForReflectionCommand } from '../../../interfaces';

/**
 * 파일 내용 반영을 위한 기존 데이터 삭제 커맨드
 */
export class DeleteExistingDataForReflectionCommand {
    constructor(public readonly data: IDeleteExistingDataForReflectionCommand) {}
}
