import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AttendanceDataContext } from '../../context/attendance-data';
import { MonthlySummaryContext } from '../../context/monthly-summary/monthly-summary.context';
import { EventInfo } from '../../domain/event-info/event-info.entity';
import { DailyEventSummary } from '../../domain/daily-event-summary/daily-event-summary.entity';
import { UsedAttendance } from '../../domain/used-attendance/used-attendance.entity';

/**
 * 근태 엑셀 관리 서비스
 *
 * 출입 이벤트 및 근태 사용 내역 엑셀 파일 업로드 및 데이터 관리 로직을 처리합니다.
 */
@Injectable()
export class AttendanceExcelManagementService {
    private readonly logger = new Logger(AttendanceExcelManagementService.name);

    constructor(
        private readonly attendanceDataContext: AttendanceDataContext,
        private readonly monthlySummaryContext: MonthlySummaryContext,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * 여러 엑셀 파일 일괄 업로드 및 처리
     *
     * @param files 업로드된 파일 목록
     * @param uploadBy 업로더 ID
     * @param year 연도
     * @param month 월
     * @param generateMonthlySummary 월간 요약 생성 여부
     * @returns 처리 결과
     */
    async uploadMultipleFiles(
        files: Express.Multer.File[],
        uploadBy: string,
        year: string,
        month: string,
        generateMonthlySummary = false,
    ) {
        // 1. 기본 유효성 검사
        if (!files || files.length === 0) {
            throw new BadRequestException('파일이 업로드되지 않았습니다.');
        }

        if (!uploadBy) {
            throw new BadRequestException('업로더 ID가 필요합니다.');
        }

        if (!year || !month) {
            throw new BadRequestException('연도와 월 정보가 필요합니다.');
        }

        // 연도와 월 유효성 검사
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);
        if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
            throw new BadRequestException('올바른 연도를 입력하세요 (2000-2100).');
        }
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            throw new BadRequestException('올바른 월을 입력하세요 (1-12).');
        }

        // 2. 파일명 유효성 검사
        const invalidFiles = files.filter((file) => {
            const fileName = file.originalname;
            return !fileName.includes('출입') && !fileName.includes('근태');
        });

        if (invalidFiles.length > 0) {
            throw new BadRequestException(
                `파일명에 "출입" 또는 "근태"가 포함되어야 합니다. 잘못된 파일: ${invalidFiles.map((f) => f.originalname).join(', ')}`,
            );
        }

        // 3. 전체 프로세스를 하나의 트랜잭션으로 처리
        // const queryRunner = this.dataSource.createQueryRunner();
        // await queryRunner.connect();
        // await queryRunner.startTransaction();

        const totalStartTime = Date.now();

        try {
            this.logger.log(`전체 파일 업로드 시작 (트랜잭션): ${files.length}개 파일`);

            // 4. 파일명으로 정렬
            const sortedFiles = [...files].sort((a, b) => a.originalname.localeCompare(b.originalname));

            // 5. 각 파일 처리 (일일 요약 생성하지 않음)
            const results = [];
            let processedCount = 0;

            for (const file of sortedFiles) {
                const fileName = file.originalname;
                const isEventFile = fileName.includes('출입');
                const isAttendanceFile = fileName.includes('근태');

                let result;

                if (isEventFile) {
                    // 출입 이벤트 파일 처리 (일일 요약 생성 안함, 외부 트랜잭션 사용)
                    result = await this.attendanceDataContext.uploadAndProcessEventHistory(
                        file,
                        uploadBy,
                        // queryRunner,
                    );
                    results.push({
                        fileName,
                        type: 'event',
                        success: true,
                        ...result,
                    });
                } else if (isAttendanceFile) {
                    // 근태 사용 파일 처리 (외부 트랜잭션 사용)
                    result = await this.attendanceDataContext.uploadAndProcessAttendanceData(
                        file,
                        uploadBy,
                        // queryRunner,
                    );
                    results.push({
                        fileName,
                        type: 'attendance',
                        success: true,
                        ...result,
                    });
                }

                processedCount++;
            }

            // 6. 모든 파일 처리 완료 후 일일 요약 생성
            const yearMonth = `${year}-${month.padStart(2, '0')}`;
            this.logger.log(`일일 요약 재생성 시작: ${yearMonth}`);

            const summaryResult = await this.attendanceDataContext.regenerateDailySummaries(year, month);

            const summaryResults = [
                {
                    yearMonth,
                    success: true,
                    ...summaryResult,
                },
            ];

            this.logger.log(`일일 요약 재생성 완료: ${yearMonth}`);

            // 7. (선택) 월간 요약 생성
            let monthlySummaryResults = null;
            if (generateMonthlySummary) {
                this.logger.log(`월간 요약 생성 시작: ${yearMonth}`);
                const monthlyStartTime = Date.now();

                try {
                    const monthlySummaries =
                        await this.monthlySummaryContext.generateMonthlySummariesForAllEmployees(yearMonth);

                    const monthlyElapsedTime = Date.now() - monthlyStartTime;
                    this.logger.log(
                        `월간 요약 생성 완료: ${monthlySummaries.length}건 (${monthlyElapsedTime}ms, ${(monthlyElapsedTime / 1000).toFixed(2)}초)`,
                    );

                    monthlySummaryResults = {
                        yearMonth,
                        success: true,
                        count: monthlySummaries.length,
                        elapsedTime: monthlyElapsedTime,
                        elapsedTimeSeconds: +(monthlyElapsedTime / 1000).toFixed(2),
                    };
                } catch (error) {
                    this.logger.error(`월간 요약 생성 실패: ${error.message}`, error.stack);
                    monthlySummaryResults = {
                        yearMonth,
                        success: false,
                        error: error.message,
                    };
                }
            }

            // 8. 모든 작업이 성공하면 커밋
            // await queryRunner.commitTransaction();

            const totalElapsedTime = Date.now() - totalStartTime;
            this.logger.log(
                `✅ 전체 파일 업로드 완료 (트랜잭션 커밋) - 총 소요시간: ${totalElapsedTime}ms (${(totalElapsedTime / 1000).toFixed(2)}초)`,
            );

            return {
                success: true,
                totalFiles: files.length,
                processedFiles: processedCount,
                results,
                summaryResults,
                monthlySummaryResults,
                performance: {
                    totalTime: totalElapsedTime,
                    totalTimeSeconds: +(totalElapsedTime / 1000).toFixed(2),
                },
            };
        } catch (error) {
            // 오류 발생 시 모든 작업 롤백
            // await queryRunner.rollbackTransaction();
            this.logger.error(`전체 파일 업로드 실패 (트랜잭션 롤백): ${error.message}`, error.stack);
            throw new BadRequestException(`파일 업로드 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            // await queryRunner.release();
        }
    }

    /**
     * 모든 근태/출입 데이터 삭제 (테스트용)
     *
     * @returns 삭제 결과
     */
    async clearAllData() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            this.logger.log('모든 근태/출입 데이터 삭제 시작');

            // 1. 각 테이블의 데이터 개수 조회
            const eventInfoCount = await queryRunner.manager.count(EventInfo);
            const dailyEventSummaryCount = await queryRunner.manager.count(DailyEventSummary);
            const usedAttendanceCount = await queryRunner.manager.count(UsedAttendance);

            this.logger.log(
                `삭제 대상: EventInfo(${eventInfoCount}), DailyEventSummary(${dailyEventSummaryCount}), UsedAttendance(${usedAttendanceCount})`,
            );

            // 2. 데이터 삭제 (역순으로 - 외래키 제약 고려)
            await queryRunner.manager.clear(DailyEventSummary);
            await queryRunner.manager.clear(UsedAttendance);
            await queryRunner.manager.clear(EventInfo);

            await queryRunner.commitTransaction();

            const totalDeleted = eventInfoCount + dailyEventSummaryCount + usedAttendanceCount;

            this.logger.log(`✅ 모든 데이터 삭제 완료: 총 ${totalDeleted}건`);

            return {
                success: true,
                message: '모든 데이터가 삭제되었습니다.',
                deletedCounts: {
                    eventInfo: eventInfoCount,
                    dailyEventSummaries: dailyEventSummaryCount,
                    usedAttendance: usedAttendanceCount,
                    total: totalDeleted,
                },
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`데이터 삭제 실패: ${error.message}`, error.stack);
            throw new BadRequestException(`데이터 삭제 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            await queryRunner.release();
        }
    }
}
