import { Injectable, Logger } from '@nestjs/common';
import { DomainMonthlyEventSummaryService } from '../../domain/monthly-event-summary/monthly-event-summary.service';
import { DomainDailyEventSummaryService } from '../../domain/daily-event-summary/daily-event-summary.service';
import { DomainUsedAttendanceService } from '../../domain/used-attendance/used-attendance.service';
import { DomainAttendanceTypeService } from '../../domain/attendance-type/attendance-type.service';
import { DataSource } from 'typeorm';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { MonthlyEventSummary } from '../../domain/monthly-event-summary/monthly-event-summary.entity';
import { DailyEventSummary } from '../../domain/daily-event-summary/daily-event-summary.entity';
import { UsedAttendance } from '../../domain/used-attendance/used-attendance.entity';

/**
 * 월간 요약 컨텍스트
 *
 * 도메인 서비스들을 조합하여 비즈니스 로직을 구현합니다.
 * - View Service: 조회 전용
 * - Service: 저장/수정 전용
 */
@Injectable()
export class MonthlySummaryContext {
    private readonly logger = new Logger(MonthlySummaryContext.name);

    constructor(
        private readonly monthlySummaryService: DomainMonthlyEventSummaryService,
        private readonly dailyEventSummaryService: DomainDailyEventSummaryService,
        private readonly usedAttendanceService: DomainUsedAttendanceService,
        private readonly attendanceTypeService: DomainAttendanceTypeService,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * 특정 연월의 모든 월간 요약 생성 (전 직원 대상)
     * - 배치 최적화된 생성 로직 사용
     * - 여러 도메인 서비스를 조합하여 처리
     */
    async generateMonthlySummariesForAllEmployees(yyyymm: string): Promise<MonthlyEventSummary[]> {
        const startTime = Date.now();
        this.logger.log(`월간 요약 생성 시작 (전 직원): ${yyyymm}`);

        const [year, month] = yyyymm.split('-');
        const startDate = format(startOfMonth(new Date(`${year}-${month}-01`)), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(new Date(`${year}-${month}-01`)), 'yyyy-MM-dd');

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const queryStartTime = Date.now();

            // 1. 일일 요약 조회 (DailyEventSummaryService 사용)
            const allDailySummaries = await this.dailyEventSummaryService.findByDateRange(startDate, endDate);

            if (allDailySummaries.length === 0) {
                this.logger.warn(`${yyyymm}의 일일 요약 데이터가 없습니다.`);
                await queryRunner.rollbackTransaction();
                return [];
            }

            // 2. 직원 ID 추출
            const employeeIds = [...new Set(allDailySummaries.map((d) => d.employeeId))];
            this.logger.log(`대상 직원 수: ${employeeIds.length}명`);

            // 3. 근태 사용 내역 조회 (UsedAttendanceService 사용)
            const allUsedAttendances = await this.usedAttendanceService.findByEmployeeIdsAndDateRange(
                employeeIds,
                startDate,
                endDate,
            );

            // 4. 근태 유형 전체 조회 (AttendanceTypeService 사용)
            const allAttendanceTypes = await this.attendanceTypeService.findAll();

            const queryElapsedTime = Date.now() - queryStartTime;
            this.logger.log(
                `데이터 조회 완료: 일일요약 ${allDailySummaries.length}건, 근태사용 ${allUsedAttendances.length}건 (${queryElapsedTime}ms)`,
            );

            // 5. 직원별로 데이터 그룹화 (비즈니스 로직)
            const dailySummariesByEmployee = this.groupDailySummariesByEmployee(allDailySummaries);
            const usedAttendancesByEmployee = this.groupUsedAttendancesByEmployee(allUsedAttendances);

            // 6. 각 직원의 월간 요약 생성 (배치 처리 - 비즈니스 로직)
            const summaries = await this.processMonthlySummariesInBatches(
                employeeIds,
                yyyymm,
                dailySummariesByEmployee,
                usedAttendancesByEmployee,
                allAttendanceTypes,
                queryRunner,
            );

            await queryRunner.commitTransaction();

            const totalTime = Date.now() - startTime;
            const processTime = Date.now() - queryStartTime - queryElapsedTime;
            this.logger.log(
                `월간 요약 생성 완료: ${summaries.length}/${employeeIds.length}건 (총 ${totalTime}ms, 조회 ${queryElapsedTime}ms, 처리 ${processTime}ms, 평균 ${Math.round(totalTime / employeeIds.length)}ms/명)`,
            );

            return summaries;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`월간 요약 생성 실패: ${error.message}`, error.stack);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 일일 요약을 직원별로 그룹화
     */
    private groupDailySummariesByEmployee(allDailySummaries: DailyEventSummary[]): Map<string, DailyEventSummary[]> {
        const dailySummariesByEmployee = new Map<string, DailyEventSummary[]>();

        allDailySummaries.forEach((summary) => {
            if (!dailySummariesByEmployee.has(summary.employeeId)) {
                dailySummariesByEmployee.set(summary.employeeId, []);
            }
            dailySummariesByEmployee.get(summary.employeeId)!.push(summary);
        });

        return dailySummariesByEmployee;
    }

    /**
     * 근태 사용 내역을 직원별로 그룹화
     */
    private groupUsedAttendancesByEmployee(allUsedAttendances: UsedAttendance[]): Map<string, UsedAttendance[]> {
        const usedAttendancesByEmployee = new Map<string, UsedAttendance[]>();

        allUsedAttendances.forEach((attendance) => {
            const empId = attendance.employee?.id || attendance.employeeId;
            if (!usedAttendancesByEmployee.has(empId)) {
                usedAttendancesByEmployee.set(empId, []);
            }
            usedAttendancesByEmployee.get(empId)!.push(attendance);
        });

        return usedAttendancesByEmployee;
    }

    /**
     * 월간 요약을 배치로 처리
     */
    private async processMonthlySummariesInBatches(
        employeeIds: string[],
        yyyymm: string,
        dailySummariesByEmployee: Map<string, DailyEventSummary[]>,
        usedAttendancesByEmployee: Map<string, UsedAttendance[]>,
        allAttendanceTypes: any[],
        queryRunner: any,
    ): Promise<MonthlyEventSummary[]> {
        const BATCH_SIZE = 20;
        const summaries: MonthlyEventSummary[] = [];

        for (let i = 0; i < employeeIds.length; i += BATCH_SIZE) {
            const batch = employeeIds.slice(i, i + BATCH_SIZE);
            const batchStartTime = Date.now();

            const batchResults = await Promise.allSettled(
                batch.map((employeeId) => {
                    const dailySummaries = dailySummariesByEmployee.get(employeeId) || [];
                    const usedAttendances = usedAttendancesByEmployee.get(employeeId) || [];

                    return this.monthlySummaryService.generateOrUpdateMonthlySummaryBatch(
                        employeeId,
                        yyyymm,
                        dailySummaries,
                        usedAttendances,
                        allAttendanceTypes,
                        queryRunner,
                    );
                }),
            );

            // 성공한 결과만 수집
            batchResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    summaries.push(result.value);
                } else {
                    this.logger.error(`월간 요약 생성 실패 (${batch[index]}, ${yyyymm}): ${result.reason?.message}`);
                }
            });

            this.logger.log(
                `배치 ${Math.floor(i / BATCH_SIZE) + 1} 완료: ${batchResults.filter((r) => r.status === 'fulfilled').length}/${batch.length}건 (${Date.now() - batchStartTime}ms)`,
            );
        }

        return summaries;
    }
}
