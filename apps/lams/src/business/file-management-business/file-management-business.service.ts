import { Injectable, Logger } from '@nestjs/common';
import { FileManagementContextService } from '../../context/file-management-context/file-management-context.service';
import { AttendanceDataContextService } from '../../context/attendance-data-context/attendance-data-context.service';
import { DataSnapshotContextService } from '../../context/data-snapshot-context/data-snapshot-context.service';
import { OrganizationManagementContextService } from '../../context/organization-management-context/organization-management-context.service';
import {
    IUploadFileResponse,
    IGetFileListWithHistoryQuery,
    IGetFileListWithHistoryResponse,
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

        // 5. 파일 내용 반영 이력 저장 (스냅샷 ID 포함)
        const historyResult = await this.fileManagementContextService.반영이력을저장한다({
            fileId: reflectionResult.fileId,
            dataSnapshotInfoId: snapshotResult.snapshot?.id,
            info: info,
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

        return {
            reflectionHistoryId: reflectionHistoryId,
            restoreSnapshotResult: {
                year: snapshotData.snapshot.yyyy,
                month: snapshotData.snapshot.mm,
            },
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
        this.logger.log(`파일 목록과 반영이력 조회: year=${query.year}, month=${query.month}`);
        return await this.fileManagementContextService.파일목록과반영이력을조회한다(query);
    }
}
