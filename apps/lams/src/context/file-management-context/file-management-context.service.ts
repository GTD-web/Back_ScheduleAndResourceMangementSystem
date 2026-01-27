import { Injectable, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UploadFileCommand } from './handlers/file-upload/commands';
import { DeleteFileCommand } from './handlers/file-delete/commands';
import {
    ProcessFileContentCommand,
    DeleteExistingDataForReflectionCommand,
    SaveReflectedDataCommand,
    SaveReflectionHistoryCommand,
} from './handlers/file-content-reflection/commands';
import { GetSnapshotDataFromHistoryQuery } from './handlers/file-content-reflection/queries';
import {
    GetFileListWithHistoryQuery,
    GetFileListQuery,
    GetReflectionHistoryQuery,
    GetFileOrgDataQuery,
} from './handlers/file-list/queries';
import {
    IUploadFileResponse,
    IRestoreFromHistoryCommand,
    IRestoreFromHistoryResponse,
    IGetFileListWithHistoryQuery,
    IGetFileListWithHistoryResponse,
    IGetFileListQuery,
    IGetFileListResponse,
    IGetReflectionHistoryQuery,
    IGetReflectionHistoryResponse,
    IGetFileOrgDataQuery,
    IGetFileOrgDataResponse,
    ISaveReflectionHistoryCommand,
    IGetSnapshotDataFromHistoryQuery,
    IGetSnapshotDataFromHistoryResponse,
} from './interfaces';
import { DomainFileContentReflectionHistoryService } from '../../domain/file-content-reflection-history/file-content-reflection-history.service';
import { DomainFileService } from '../../domain/file/file.service';
import { IStorageService } from '../../integrations/storage';

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
        private readonly fileService: DomainFileService,
        @Inject('IStorageService')
        private readonly storageService: IStorageService,
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
     * 오케스트레이션 로직:
     * 1. 파일 데이터 가공 (ProcessFileContentCommand)
     * 2. 기존 데이터 삭제 (DeleteExistingDataForReflectionCommand)
     * 3. 반영 데이터 저장 (SaveReflectedDataCommand)
     * 4. 결과 반환 (이력 저장은 Business Service에서 처리)
     *
     * @param fileId 파일 ID
     * @param employeeIds 적용할 직원 ID 목록
     * @param year 연도
     * @param month 월
     * @param day 일자 (선택)
     * @param performedBy 수행자 ID
     * @param info 추가 정보 (선택)
     * @returns 파일 내용 반영 결과 (이력 ID는 포함하지 않음)
     */
    async 파일내용을반영한다(
        fileId: string,
        employeeIds: string[],
        year: string,
        month: string,
        performedBy: string,
    ): Promise<{
        fileId: string;
        processedData: {
            eventInfos: any[];
            usedAttendances: any[];
            processedEmployeeIds: string[];
        };
        employeeNumbers: string[];
        selectedEmployeeIds: string[];
        fileType: string;
        year: string;
        month: string;
        employeeIds: string[];
    }> {
        // 1. 파일 데이터 가공
        const processResult = await this.commandBus.execute(
            new ProcessFileContentCommand({
                fileId,
                employeeIds,
                year,
                month,
                performedBy,
                
            }),
        );

        // 2. 기존 데이터 삭제
        await this.commandBus.execute(
            new DeleteExistingDataForReflectionCommand({
                fileType: processResult.fileType,
                year: processResult.year,
                month: processResult.month,
                employeeIds: processResult.employeeIds,
                employeeNumbers: processResult.employeeNumbers,
                selectedEmployeeIds: processResult.selectedEmployeeIds,
            }),
        );

        // 3. 반영 데이터 저장
        await this.commandBus.execute(
            new SaveReflectedDataCommand({
                eventInfos: processResult.processedData.eventInfos,
                usedAttendances: processResult.processedData.usedAttendances,
            }),
        );

        // 4. 결과 반환 (이력 저장은 Business Service에서 처리)
        return {
            fileId: processResult.fileId,
            processedData: processResult.processedData,
            employeeNumbers: processResult.employeeNumbers,
            selectedEmployeeIds: processResult.selectedEmployeeIds,
            fileType: processResult.fileType,
            year: processResult.year,
            month: processResult.month,
            employeeIds: processResult.employeeIds,
        };
    }

    /**
     * 반영 이력을 저장한다
     *
     * 파일 내용 반영에 대한 이력을 저장합니다.
     *
     * @param command 반영 이력 저장 명령
     * @returns 반영 이력 저장 결과
     */
    async 반영이력을저장한다(command: ISaveReflectionHistoryCommand): Promise<{ id: string }> {
        return await this.commandBus.execute(new SaveReflectionHistoryCommand(command));
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
     * 스냅샷 데이터를 이력으로부터 조회한다
     *
     * 이력 ID를 통해 스냅샷 데이터를 조회합니다.
     *
     * @param query 스냅샷 데이터 조회 쿼리
     * @returns 스냅샷 데이터 조회 결과
     */
    async 스냅샷데이터를이력으로부터조회한다(
        query: IGetSnapshotDataFromHistoryQuery,
    ): Promise<IGetSnapshotDataFromHistoryResponse> {
        const queryInstance = new GetSnapshotDataFromHistoryQuery(query);
        return await this.queryBus.execute(queryInstance);
    }

    /**
     * 스냅샷 데이터로 파일 데이터를 복원한다
     *
     * 스냅샷에 저장된 EventInfo와 UsedAttendance 데이터를 복원합니다.
     *
     * 오케스트레이션 로직:
     * 1. 기존 데이터 전체 삭제 (DeleteExistingDataForReflectionCommand - deleteAll=true)
     * 2. 조회된 데이터 저장 (SaveReflectedDataCommand)
     * 3. 결과 반환
     *
     * @param snapshotData 스냅샷 데이터 조회 결과
     * @returns 복원 결과
     */
    async 스냅샷데이터로파일데이터를복원한다(
        snapshotData: IGetSnapshotDataFromHistoryResponse,
    ): Promise<IRestoreFromHistoryResponse> {
        // 1. 기존 데이터 전체 삭제 (deleteAll=true로 전체 삭제)
        await this.commandBus.execute(
            new DeleteExistingDataForReflectionCommand({
                fileType: '', // 전체 삭제이므로 fileType 무시
                year: snapshotData.year,
                month: snapshotData.month,
                employeeIds: [],
                employeeNumbers: [],
                selectedEmployeeIds: [],
                deleteAll: true, // 전체 삭제
            }),
        );

        // 2. 조회된 데이터 저장
        await this.commandBus.execute(
            new SaveReflectedDataCommand({
                eventInfos: snapshotData.eventInfos,
                usedAttendances: snapshotData.usedAttendances,
            }),
        );

        // 3. 결과 반환
        return {
            year: snapshotData.year,
            month: snapshotData.month,
        };
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

    /**
     * 파일 목록을 조회한다
     *
     * @param query 파일 목록 조회 쿼리
     * @returns 파일 목록 조회 결과
     */
    async 파일목록을조회한다(query: IGetFileListQuery): Promise<IGetFileListResponse> {
        const queryInstance = new GetFileListQuery(query);
        return await this.queryBus.execute(queryInstance);
    }

    /**
     * 반영이력을 조회한다
     *
     * @param query 반영이력 조회 쿼리
     * @returns 반영이력 조회 결과
     */
    async 반영이력을조회한다(
        query: IGetReflectionHistoryQuery,
    ): Promise<IGetReflectionHistoryResponse> {
        const queryInstance = new GetReflectionHistoryQuery(query);
        return await this.queryBus.execute(queryInstance);
    }

    /**
     * 파일 orgData를 조회한다
     *
     * @param query 파일 orgData 조회 쿼리
     * @returns 파일 orgData 조회 결과
     */
    async 파일orgData를조회한다(query: IGetFileOrgDataQuery): Promise<IGetFileOrgDataResponse> {
        const queryInstance = new GetFileOrgDataQuery(query);
        return await this.queryBus.execute(queryInstance);
    }

    /**
     * 파일을 삭제한다
     *
     * @param fileId 파일 ID
     * @param userId 사용자 ID
     */
    async 파일을삭제한다(fileId: string, userId: string): Promise<void> {
        const command = new DeleteFileCommand({
            fileId,
            userId,
        });
        return await this.commandBus.execute(command);
    }

    /**
     * 파일 정보를 조회한다
     *
     * @param fileId 파일 ID
     * @returns 파일 정보
     */
    async 파일정보를조회한다(fileId: string) {
        return await this.fileService.ID로조회한다(fileId);
    }

    /**
     * StorageService를 가져온다
     *
     * @returns StorageService 인스턴스
     */
    getStorageService(): IStorageService {
        return this.storageService;
    }
}
