import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FileManagementContextService } from '../../context/file-management-context/file-management-context.service';
import { AttendanceDataContextService } from '../../context/attendance-data-context/attendance-data-context.service';
import { DataSnapshotContextService } from '../../context/data-snapshot-context/data-snapshot-context.service';
import { OrganizationManagementContextService } from '../../context/organization-management-context/organization-management-context.service';
import {
    IUploadFileResponse,
    IGetFileListWithHistoryQuery,
    IGetFileListWithHistoryResponse,
    IGetFileListQuery,
    IGetFileListResponse,
    IGetReflectionHistoryQuery,
    IGetReflectionHistoryResponse,
    IGetFileOrgDataQuery,
    IGetFileOrgDataResponse,
} from '../../context/file-management-context/interfaces';
import {
    IGenerateDailySummariesResponse,
    IGenerateMonthlySummariesResponse,
} from '../../context/attendance-data-context/interfaces';
import {
    IRestoreFromSnapshotResponse,
    IGetSnapshotByIdQuery,
    IGetSnapshotByIdResponse,
} from '../../context/data-snapshot-context/interfaces';
import { IGetSnapshotDataFromHistoryQuery } from '../../context/file-management-context/interfaces';

/**
 * 파일관리 비즈니스 서비스
 *
 * 파일관리 관련 비즈니스 로직을 오케스트레이션합니다.
 * - 파일 업로드
 * - 파일 내용 반영 (요약 생성 포함)
 */
@Injectable()
export class FileManagementBusinessService {
    private readonly logger = new Logger(FileManagementBusinessService.name);

    constructor(
        private readonly fileManagementContextService: FileManagementContextService,
        private readonly attendanceDataContextService: AttendanceDataContextService,
        private readonly dataSnapshotContextService: DataSnapshotContextService,
        private readonly organizationManagementContextService: OrganizationManagementContextService,
    ) {}

    /**
     * 파일을 업로드한다
     *
     * @param file 업로드된 파일
     * @param uploadBy 업로드한 사용자 ID
     * @param year 연도
     * @param month 월
     * @returns 업로드 결과
     */
    async 파일을업로드한다(
        file: Express.Multer.File,
        uploadBy: string,
        year?: string,
        month?: string,
    ): Promise<IUploadFileResponse> {
        this.logger.log(`파일 업로드 시작: ${file.originalname}`);
        const result = await this.fileManagementContextService.파일을업로드한다(file, uploadBy, year, month);
        this.logger.log(`파일 업로드 완료: ${result.fileId}`);
        return result;
    }

    /**
     * 파일 내용을 반영한다
     *
     * 파일의 내용을 반영한 후 일일 요약과 월간 요약을 자동으로 생성합니다.
     *
     * @param fileId 파일 ID
     * @param employeeNumbers 적용할 직원 번호 목록
     * @param year 연도
     * @param month 월
     * @param performedBy 수행자 ID
     * @param info 추가 정보 (선택)
     * @returns 반영 결과 및 요약 생성 결과
     */
    async 파일내용을반영한다(
        fileId: string,
        employeeNumbers: string[],
        year: string,
        month: string,
        performedBy: string,
        info?: string,
    ): Promise<{
        fileId: string;
        reflectionHistoryId: string;
        dailySummaryResult: IGenerateDailySummariesResponse;
        monthlySummaryResult: IGenerateMonthlySummariesResponse;
    }> {

        // 0. 회사 전체 월간 요약 스냅샷 저장
        await this.dataSnapshotContextService.회사전체월간요약스냅샷을저장한다({
            year,
            month,
            performedBy,
        });

        const employeeIds =
            await this.organizationManagementContextService.직원번호목록을ID목록으로조회한다(employeeNumbers);
        this.logger.log(`파일 내용 반영 시작: fileId=${fileId}, 직원 수=${employeeIds.length}`);


        // 1. 파일 내용 반영
        this.logger.log(`파일 내용 반영 중: fileId=${fileId}`);
        const reflectionResult = await this.fileManagementContextService.파일내용을반영한다(
            fileId,
            employeeIds,
            year,
            month,
            performedBy,
        );
        this.logger.log(`파일 내용 반영 완료: fileId=${fileId}`);

        // 2. 일일 요약 생성
        const dailySummaryResult = await this.attendanceDataContextService.일일요약을생성한다({
            year,
            month,
            performedBy,
        });

        this.logger.log(
            `일일 요약 생성 완료: daily=${dailySummaryResult.statistics.dailyEventSummaryCount}, issues=${dailySummaryResult.statistics.attendanceIssueCount}`,
        );

        // 3. 월간 요약 생성
        const monthlySummaryResult = await this.attendanceDataContextService.월간요약을생성한다(
            year,
            month,
            performedBy,
        );

        this.logger.log(`월간 요약 생성 완료: monthly=${monthlySummaryResult.statistics.monthlyEventSummaryCount}`);

        // 4. 회사 전체 월간 요약 스냅샷 저장 (reflection data 포함)
        const snapshotResult = await this.dataSnapshotContextService.회사전체월간요약스냅샷을저장한다({
            year,
            month,
            performedBy,
        });

        this.logger.log(`회사 전체 월간 요약 스냅샷 저장 완료: year=${year}, month=${month}`);

        // 5. 파일 내용 반영 이력 저장 (스냅샷 ID 포함, 선택 상태 설정용 performedBy 전달)
        const historyResult = await this.fileManagementContextService.반영이력을저장한다({
            fileId: reflectionResult.fileId,
            dataSnapshotInfoId: snapshotResult.snapshot?.id,
            info: info,
            performedBy,
        });

        this.logger.log(`파일 내용 반영 이력 저장 완료: reflectionHistoryId=${historyResult.id}`);

        return {
            fileId: reflectionResult.fileId,
            reflectionHistoryId: historyResult.id,
            dailySummaryResult,
            monthlySummaryResult,
        };
    }

    /**
     * 이력으로 되돌리기
     *
     * 파일 내용 반영 이력을 선택하여 해당 이력의 데이터로 되돌립니다.
     *
     * @param reflectionHistoryId 반영 이력 ID
     * @param year 연도
     * @param month 월
     * @param performedBy 수행자 ID
     * @returns 이력으로 되돌리기 결과
     */
    async 파일내용반영이력으로되돌리기(
        reflectionHistoryId: string,
        year: string,
        month: string,
        performedBy: string,
    ): Promise<{
        reflectionHistoryId: string;
        restoreSnapshotResult: IRestoreFromSnapshotResponse;
    }> {
        this.logger.log(
            `이력으로 되돌리기 시작: reflectionHistoryId=${reflectionHistoryId}, year=${year}, month=${month}`,
        );

        // 0. 해당 연월에 월간 요약 데이터가 있다면 스냅샷으로 저장
        await this.dataSnapshotContextService.회사전체월간요약스냅샷을저장한다({ year, month, performedBy });

        // 1. 이력과 스냅샷, 하위 스냅샷 조회
        const snapshotData = await this.fileManagementContextService.스냅샷데이터를이력으로부터조회한다({
            reflectionHistoryId,
        });

        this.logger.log(`스냅샷 조회 완료: snapshotId=${snapshotData.snapshot.id}, children=${snapshotData.snapshot.children?.length || 0}`);

        // 2. 스냅샷 데이터로 파일 데이터 복원 (EventInfo, UsedAttendance 복원)
        const restoreResult = await this.fileManagementContextService.스냅샷데이터로파일데이터를복원한다(
            snapshotData,
            performedBy,
        );

        this.logger.log(`이력으로 되돌리기 완료: year=${year}, month=${month}`);

        // 3. 일일요약 복원 (스냅샷 데이터에서 내부적으로 추출)
        await this.attendanceDataContextService.일일요약을복원한다({
            snapshotData: snapshotData.snapshot,
            year,
            month,
            performedBy,
        });

        this.logger.log(`일일요약 복원 완료`);

        // 4. 월간요약 복원 (스냅샷 데이터에서 내부적으로 추출)
        await this.attendanceDataContextService.월간요약을복원한다({
            snapshotData: snapshotData.snapshot,
            year,
            month,
            performedBy,
        });

        this.logger.log(`월간요약 복원 완료`);

        // 5. 되돌린 반영이력을 선택 상태로 설정 (is_selected true, selected_at 갱신)
        await this.fileManagementContextService.반영이력선택상태로설정한다(
            reflectionHistoryId,
            performedBy,
        );

        this.logger.log(`반영이력 선택 상태 설정 완료`);

        return {
            reflectionHistoryId: reflectionHistoryId,
            restoreSnapshotResult: {
                year: snapshotData.snapshot.yyyy,
                month: snapshotData.snapshot.mm,
            },
        };
    }

    /**
     * 파일 목록을 조회한다
     *
     * @param query 파일 목록 조회 쿼리
     * @returns 파일 목록 조회 결과 (data 컬럼 제외)
     */
    async 파일목록을조회한다(query: IGetFileListQuery): Promise<IGetFileListResponse> {
        this.logger.log(`파일 목록 조회: year=${query.year}, month=${query.month}`);
        return await this.fileManagementContextService.파일목록을조회한다(query);
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
        this.logger.log(`반영이력 조회: fileId=${query.fileId}`);
        return await this.fileManagementContextService.반영이력을조회한다(query);
    }

    /**
     * 파일 orgData를 조회한다
     *
     * @param query 파일 orgData 조회 쿼리
     * @returns 파일 orgData 조회 결과
     */
    async 파일orgData를조회한다(query: IGetFileOrgDataQuery): Promise<IGetFileOrgDataResponse> {
        this.logger.log(`파일 orgData 조회: fileId=${query.fileId}`);
        return await this.fileManagementContextService.파일orgData를조회한다(query);
    }

    /**
     * 파일을 삭제한다
     *
     * 실제 저장소의 파일과 데이터베이스 레코드를 모두 삭제합니다.
     *
     * @param fileId 파일 ID
     * @param userId 사용자 ID
     */
    async 파일을삭제한다(fileId: string, userId: string): Promise<void> {
        this.logger.log(`파일 삭제 시작: fileId=${fileId}, userId=${userId}`);

        // 1. 파일 정보 조회
        const file = await this.fileManagementContextService.파일정보를조회한다(fileId);

        if (!file) {
            throw new NotFoundException(`파일을 찾을 수 없습니다. (id: ${fileId})`);
        }

        // 2. filePath에서 fileKey 추출
        // filePath는 `/storage/${fileKey}` 형식이거나 `fileKey` 형식일 수 있음
        let fileKey = file.filePath;
        if (fileKey.startsWith('/storage/')) {
            fileKey = fileKey.replace('/storage/', '');
        }

        // 3. StorageService를 통해 실제 파일 삭제
        try {
            const storageService = this.fileManagementContextService.getStorageService();
            await storageService.deleteFile({ fileKey });
            this.logger.log(`저장소 파일 삭제 완료: fileKey=${fileKey}`);
        } catch (error) {
            // 파일이 이미 삭제되었거나 없는 경우에도 계속 진행 (Soft Delete는 수행)
            this.logger.warn(`저장소 파일 삭제 실패 (계속 진행): fileKey=${fileKey}, error=${error.message}`);
        }

        // 4. 데이터베이스 Soft Delete 수행
        await this.fileManagementContextService.파일을삭제한다(fileId, userId);

        this.logger.log(`파일 삭제 완료: fileId=${fileId}`);
    }

    /**
     * 파일을 다운로드한다
     *
     * @param fileId 파일 ID
     * @returns 파일 다운로드 스트림 (Buffer) 및 파일명
     */
    async 파일을다운로드한다(fileId: string): Promise<{ buffer: Buffer; fileName: string }> {
        this.logger.log(`파일 다운로드 시작: fileId=${fileId}`);

        // 파일 정보 조회
        const file = await this.fileManagementContextService.파일정보를조회한다(fileId);

        if (!file) {
            throw new NotFoundException(`파일을 찾을 수 없습니다. (id: ${fileId})`);
        }

        // StorageService를 통해 파일 다운로드
        const storageService = this.fileManagementContextService.getStorageService();
        const buffer = await storageService.downloadFileStream(file.filePath);

        const fileName = file.fileOriginalName || file.fileName;
        this.logger.log(`파일 다운로드 완료: fileId=${fileId}, fileName=${fileName}`);

        return {
            buffer,
            fileName,
        };
    }
}
