import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UploadFileCommand } from './handlers/file-upload/commands';
import { ReflectFileContentCommand } from './handlers/file-content-reflection/commands';
import { IUploadFileResponse, IReflectFileContentResponse } from './interfaces';

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
}
