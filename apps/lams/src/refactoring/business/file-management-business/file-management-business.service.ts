import { Injectable, Logger } from '@nestjs/common';
import { FileManagementContextService } from '../../context/file-management-context/file-management-context.service';
import { AttendanceDataContextService } from '../../context/attendance-data-context/attendance-data-context.service';
import { DataSnapshotContextService } from '../../context/data-snapshot-context/data-snapshot-context.service';
import {
    IUploadFileResponse,
    IReflectFileContentResponse,
    IGetFileListWithHistoryQuery,
    IGetFileListWithHistoryResponse,
} from '../../context/file-management-context/interfaces';
import {
    IGenerateDailySummariesResponse,
    IGenerateMonthlySummariesResponse,
} from '../../context/attendance-data-context/interfaces';

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
     * 여러 파일의 내용을 순서대로 반영한 후 일일 요약과 월간 요약을 자동으로 생성합니다.
     *
     * @param fileIds 파일 ID 목록 (순서대로 반영됨)
     * @param employeeIds 적용할 직원 ID 목록
     * @param year 연도
     * @param month 월
     * @param performedBy 수행자 ID
     * @returns 반영 결과 및 요약 생성 결과
     */
    async 파일내용을반영한다(
        fileIds: string[],
        employeeIds: string[],
        year: string,
        month: string,
        performedBy: string,
    ): Promise<{
        reflections: Array<{
            fileId: string;
            reflectionHistoryId: string;
        }>;
        dailySummaryResult: IGenerateDailySummariesResponse;
        monthlySummaryResult: IGenerateMonthlySummariesResponse;
    }> {
        this.logger.log(`파일 내용 반영 시작: fileIds=${fileIds.length}개, 직원 수=${employeeIds.length}`);

        // 0. 해당 연월에 월간 요약 데이터가 있다면 스냅샷으로 저장
        await this.dataSnapshotContextService.해당연월의모든부서기존월간요약스냅샷을저장한다(year, month, performedBy);

        // 1. 파일 내용 반영 (순서대로 반복 처리)
        const reflections: Array<{ fileId: string; reflectionHistoryId: string }> = [];
        for (const fileId of fileIds) {
            this.logger.log(`파일 내용 반영 중: fileId=${fileId}`);
            const reflectionResult = await this.fileManagementContextService.파일내용을반영한다(
                fileId,
                employeeIds,
                year,
                month,
                performedBy,
            );
            reflections.push({
                fileId: reflectionResult.fileId,
                reflectionHistoryId: reflectionResult.reflectionHistoryId,
            });
            this.logger.log(
                `파일 내용 반영 완료: fileId=${fileId}, reflectionHistoryId=${reflectionResult.reflectionHistoryId}`,
            );
        }

        this.logger.log(`모든 파일 내용 반영 완료: 총 ${reflections.length}개 파일`);

        // 2. 일일 요약 생성
        const dailySummaryResult = await this.attendanceDataContextService.일일요약을생성한다(year, month, performedBy);

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

        return {
            reflections,
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
    async 이력으로되돌리기(
        reflectionHistoryId: string,
        year: string,
        month: string,
        performedBy: string,
    ): Promise<{
        reflectionHistoryId: string;
        dailySummaryResult: IGenerateDailySummariesResponse;
        monthlySummaryResult: IGenerateMonthlySummariesResponse;
    }> {
        this.logger.log(
            `이력으로 되돌리기 시작: reflectionHistoryId=${reflectionHistoryId}, year=${year}, month=${month}`,
        );

        // 0. 해당 연월에 월간 요약 데이터가 있다면 스냅샷으로 저장
        await this.dataSnapshotContextService.해당연월의모든부서기존월간요약스냅샷을저장한다(year, month, performedBy);

        // 1. 이력으로 되돌리기
        const restoreResult = await this.fileManagementContextService.이력으로되돌리기({
            reflectionHistoryId,
            performedBy,
        });

        this.logger.log(`이력으로 되돌리기 완료: year=${year}, month=${month}`);

        // 2. 일일 요약 생성
        const dailySummaryResult = await this.attendanceDataContextService.일일요약을생성한다(year, month, performedBy);

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

        return {
            reflectionHistoryId: restoreResult.reflectionHistoryId,
            dailySummaryResult,
            monthlySummaryResult,
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
