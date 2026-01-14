import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UploadFileCommand } from './handlers/file-upload/commands';
import { ReflectFileContentCommand, RestoreFromHistoryCommand } from './handlers/file-content-reflection/commands';
import { GetFileListWithHistoryQuery } from './handlers/file-list/queries';
import {
    IUploadFileResponse,
    IReflectFileContentResponse,
    IRestoreFromHistoryCommand,
    IRestoreFromHistoryResponse,
    IGetFileListWithHistoryQuery,
    IGetFileListWithHistoryResponse,
} from './interfaces';
import { DomainFileContentReflectionHistoryService } from '../../domain/file-content-reflection-history/file-content-reflection-history.service';

/**
 * 파일관리 컨텍스트 서비스
 *
 * CommandBus/QueryBus를 통해 Handler를 호출하는 서비스 레이어입니다.
 */
@Injectable()
export class FileManagementContextService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly fileContentReflectionHistoryService: DomainFileContentReflectionHistoryService,
    ) {}

    /**
     * 파일을 업로드한다
     *
     * @param file 업로드된 파일
     * @param uploadBy 업로드한 사용자 ID
     * @param year 연도 (선택)
     * @param month 월 (선택)
     * @returns 파일 업로드 결과
     */
    async 파일을업로드한다(
        file: Express.Multer.File,
        uploadBy: string,
        year?: string,
        month?: string,
    ): Promise<IUploadFileResponse> {
        const command = new UploadFileCommand({
            file,
            uploadBy,
            year,
            month,
        });
        return await this.commandBus.execute(command);
    }

    /**
     * 파일 내용을 반영한다
     *
     * @param fileId 파일 ID
     * @param employeeIds 적용할 직원 ID 목록
     * @param year 연도
     * @param month 월
     * @param day 일자 (선택)
     * @param performedBy 수행자 ID
     * @returns 파일 내용 반영 결과
     */
    async 파일내용을반영한다(
        fileId: string,
        employeeIds: string[],
        year: string,
        month: string,
        performedBy: string,
    ): Promise<IReflectFileContentResponse> {
        const command = new ReflectFileContentCommand({
            fileId,
            employeeIds,
            year,
            month,
            performedBy,
        });
        return await this.commandBus.execute(command);
    }

    /**
     * 이력을 조회한다
     *
     * @param reflectionHistoryId 반영 이력 ID
     * @returns 이력 정보
     */
    async 이력을조회한다(reflectionHistoryId: string) {
        return await this.fileContentReflectionHistoryService.ID로조회한다(reflectionHistoryId);
    }

    /**
     * 이력으로 되돌리기
     *
     * @param command 이력으로 되돌리기 명령
     * @returns 이력으로 되돌리기 결과
     */
    async 이력으로되돌리기(command: IRestoreFromHistoryCommand): Promise<IRestoreFromHistoryResponse> {
        const commandInstance = new RestoreFromHistoryCommand(command);
        return await this.commandBus.execute(commandInstance);
    }

    /**
     * 파일 목록과 반영이력을 조회한다
     *
     * @param query 파일 목록과 반영이력 조회 쿼리
     * @returns 파일 목록과 반영이력 조회 결과
     */
    async 파일목록과반영이력을조회한다(
        query: IGetFileListWithHistoryQuery,
    ): Promise<IGetFileListWithHistoryResponse> {
        const queryInstance = new GetFileListWithHistoryQuery(query);
        return await this.queryBus.execute(queryInstance);
    }
}
