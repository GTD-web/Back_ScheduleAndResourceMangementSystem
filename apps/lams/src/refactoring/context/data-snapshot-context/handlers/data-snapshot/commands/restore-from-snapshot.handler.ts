import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RestoreFromSnapshotCommand } from './restore-from-snapshot.command';
import { IRestoreFromSnapshotResponse } from '../../../interfaces';
import { DomainDataSnapshotInfoService } from '../../../../../domain/data-snapshot-info/data-snapshot-info.service';
import { DataSnapshotInfo } from '../../../../../domain/data-snapshot-info/data-snapshot-info.entity';
import { DomainAttendanceIssueService } from '../../../../../domain/attendance-issue/attendance-issue.service';
import { DomainDailySummaryChangeHistoryService } from '../../../../../domain/daily-summary-change-history/daily-summary-change-history.service';
import { AttendanceIssue } from '../../../../../domain/attendance-issue/attendance-issue.entity';
import { DailySummaryChangeHistory } from '../../../../../domain/daily-summary-change-history/daily-summary-change-history.entity';
import { DailyEventSummary } from '../../../../../domain/daily-event-summary/daily-event-summary.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenerateDailySummariesCommand } from '../../../../attendance-data-context/handlers/attendance-data/commands/generate-daily-summaries.command';
import { GenerateMonthlySummariesCommand } from '../../../../attendance-data-context/handlers/attendance-data/commands/generate-monthly-summaries.command';
import {
    IMonthlyEventSummaryWithDailySummaries,
    IDailyEventSummaryWithHistory,
} from '../../../../attendance-data-context/interfaces/response/get-monthly-summaries-response.interface';
import { AttendanceIssueDTO } from '../../../../../domain/attendance-issue/attendance-issue.types';
import { DailySummaryChangeHistoryDTO } from '../../../../../domain/daily-summary-change-history/daily-summary-change-history.types';

/**
 * 스냅샷으로부터 복원 Handler
 *
 * 선택된 스냅샷 데이터를 기반으로 월간/일간 요약 데이터를 덮어씌웁니다.
 */
@CommandHandler(RestoreFromSnapshotCommand)
export class RestoreFromSnapshotHandler implements ICommandHandler<
    RestoreFromSnapshotCommand,
    IRestoreFromSnapshotResponse
> {
    private readonly logger = new Logger(RestoreFromSnapshotHandler.name);

    constructor(
        private readonly dataSnapshotInfoService: DomainDataSnapshotInfoService,
        private readonly attendanceIssueService: DomainAttendanceIssueService,
        private readonly dailySummaryChangeHistoryService: DomainDailySummaryChangeHistoryService,
        @InjectRepository(DataSnapshotInfo)
        private readonly dataSnapshotInfoRepository: Repository<DataSnapshotInfo>,
        private readonly commandBus: CommandBus,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: RestoreFromSnapshotCommand): Promise<IRestoreFromSnapshotResponse> {
        const { snapshotId, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`스냅샷으로부터 복원 시작: snapshotId=${snapshotId}`);

                // 1. 스냅샷 정보 및 자식 데이터 조회 (엔티티 직접 조회)
                const snapshotEntity = await manager.findOne(DataSnapshotInfo, {
                    where: { id: snapshotId },
                    relations: ['dataSnapshotChildInfoList'],
                });
                if (!snapshotEntity) {
                    throw new NotFoundException(`스냅샷을 찾을 수 없습니다. (snapshotId: ${snapshotId})`);
                }

                const { yyyy: year, mm: month } = snapshotEntity;
                const yyyymm = `${year}-${month.padStart(2, '0')}`;

                // 2. 스냅샷 자식 데이터 조회
                const snapshotChildren = snapshotEntity.dataSnapshotChildInfoList || [];
                if (snapshotChildren.length === 0) {
                    this.logger.warn(`스냅샷에 자식 데이터가 없습니다. snapshotId=${snapshotId}`);
                    return {
                        snapshotId,
                        year,
                        month,
                        restoredCount: {
                            monthlySummaryCount: 0,
                            dailySummaryCount: 0,
                        },
                    };
                }

                // 3. 스냅샷 데이터에서 일일 요약 정보 추출 및 변환
                const dailyEventSummaries: Array<{
                    date: string;
                    employee_id: string;
                    is_holiday: boolean;
                    enter: string | null;
                    leave: string | null;
                    real_enter: string | null;
                    real_leave: string | null;
                    is_checked: boolean;
                    is_late: boolean;
                    is_early_leave: boolean;
                    is_absent: boolean;
                    work_time: number | null;
                    note: string | null;
                }> = [];

                // 스냅샷 데이터에서 이슈와 변경이력 정보도 추출 (일일 요약 복원 후 사용)
                const snapshotIssues: Array<{
                    date: string;
                    employee_id: string;
                    issue: AttendanceIssueDTO;
                }> = [];
                const snapshotHistories: Array<{
                    date: string;
                    employee_id: string;
                    history: DailySummaryChangeHistoryDTO;
                }> = [];

                snapshotChildren.forEach((child) => {
                    try {
                        // TypeORM의 JSON 컬럼은 자동으로 파싱되므로 JSON.parse() 불필요
                        // 엔티티 타입이 string으로 정의되어 있지만 실제로는 객체로 반환됨
                        const snapshotData = child.snapshot_data as unknown as IMonthlyEventSummaryWithDailySummaries;
                        if (snapshotData && snapshotData.dailySummaries && snapshotData.dailySummaries.length > 0) {
                            snapshotData.dailySummaries.forEach((daily) => {
                                dailyEventSummaries.push({
                                    date: daily.date,
                                    employee_id: daily.employeeId,
                                    is_holiday: daily.isHoliday,
                                    enter: daily.enter,
                                    leave: daily.leave,
                                    real_enter: daily.realEnter,
                                    real_leave: daily.realLeave,
                                    is_checked: daily.isChecked,
                                    is_late: daily.isLate,
                                    is_early_leave: daily.isEarlyLeave,
                                    is_absent: daily.isAbsent,
                                    work_time: daily.workTime,
                                    note: daily.note,
                                });

                                // 이슈 정보 추출 (스냅샷 데이터에 포함된 경우)
                                const dailyWithIssues = daily as any; // 스냅샷 데이터에는 issues가 포함될 수 있음
                                if (
                                    dailyWithIssues.issues &&
                                    Array.isArray(dailyWithIssues.issues) &&
                                    dailyWithIssues.issues.length > 0
                                ) {
                                    dailyWithIssues.issues.forEach((issue: AttendanceIssueDTO) => {
                                        snapshotIssues.push({
                                            date: daily.date,
                                            employee_id: daily.employeeId,
                                            issue,
                                        });
                                    });
                                }

                                // 변경이력 정보 추출
                                if (daily.history && daily.history.length > 0) {
                                    daily.history.forEach((history) => {
                                        snapshotHistories.push({
                                            date: daily.date,
                                            employee_id: daily.employeeId,
                                            history,
                                        });
                                    });
                                }
                            });
                        }
                    } catch (error) {
                        this.logger.error(
                            `스냅샷 데이터 처리 실패 (childId=${child.id}): ${error.message}`,
                            error.stack,
                        );
                    }
                });

                if (dailyEventSummaries.length === 0) {
                    this.logger.warn(`스냅샷에 일일 요약 데이터가 없습니다. snapshotId=${snapshotId}`);
                    return {
                        snapshotId,
                        year,
                        month,
                        restoredCount: {
                            monthlySummaryCount: 0,
                            dailySummaryCount: 0,
                        },
                    };
                }

                // 4. 일일 요약 생성 (스냅샷 데이터 기반)
                const dailySummaryResult = await this.commandBus.execute(
                    new GenerateDailySummariesCommand({
                        year,
                        month,
                        performedBy,
                        snapshotData: {
                            dailyEventSummaries,
                        },
                    }),
                );

                // 5. 복원된 일일 요약 조회 (날짜와 직원 ID 기준으로 매핑)
                const restoredDailySummaries = await manager
                    .createQueryBuilder(DailyEventSummary, 'des')
                    .where('des.deleted_at IS NULL')
                    .andWhere('des.date >= :startDate', {
                        startDate: `${year}-${month.padStart(2, '0')}-01`,
                    })
                    .andWhere('des.date <= :endDate', {
                        endDate: `${year}-${month.padStart(2, '0')}-31`,
                    })
                    .getMany();

                // 날짜와 직원 ID를 키로 하는 매핑 생성
                const dailySummaryMap = new Map<string, DailyEventSummary>();
                restoredDailySummaries.forEach((summary) => {
                    const key = `${summary.date}_${summary.employee_id}`;
                    dailySummaryMap.set(key, summary);
                });

                // 6. 이슈 복원 (ID로 기존 데이터 찾아서 복원 또는 새로 생성)
                let restoredIssueCount = 0;
                for (const snapshotIssue of snapshotIssues) {
                    const key = `${snapshotIssue.date}_${snapshotIssue.employee_id}`;
                    const dailySummary = dailySummaryMap.get(key);
                    if (!dailySummary) {
                        continue;
                    }

                    try {
                        // 스냅샷 데이터에 원본 ID가 있는 경우, 기존 데이터 조회 (소프트 삭제된 것 포함)
                        let existingIssue: AttendanceIssue | null = null;
                        if (snapshotIssue.issue.id) {
                            existingIssue = await manager.findOne(AttendanceIssue, {
                                where: { id: snapshotIssue.issue.id },
                                withDeleted: true,
                            });
                        }

                        if (existingIssue) {
                            // 기존 데이터 복원 및 업데이트
                            existingIssue.deleted_at = null; // 복원
                            existingIssue.employee_id = snapshotIssue.employee_id;
                            existingIssue.date = snapshotIssue.date;
                            existingIssue.daily_event_summary_id = dailySummary.id;
                            existingIssue.problematic_enter_time = snapshotIssue.issue.problematicEnterTime;
                            existingIssue.problematic_leave_time = snapshotIssue.issue.problematicLeaveTime;
                            existingIssue.corrected_enter_time = snapshotIssue.issue.correctedEnterTime;
                            existingIssue.corrected_leave_time = snapshotIssue.issue.correctedLeaveTime;
                            existingIssue.problematic_attendance_type_ids =
                                snapshotIssue.issue.problematicAttendanceTypeIds;
                            existingIssue.corrected_attendance_type_ids =
                                snapshotIssue.issue.correctedAttendanceTypeIds;
                            existingIssue.description = snapshotIssue.issue.description;
                            existingIssue.status = snapshotIssue.issue.status;
                            existingIssue.confirmed_by = snapshotIssue.issue.confirmedBy;
                            existingIssue.confirmed_at = snapshotIssue.issue.confirmedAt;
                            existingIssue.resolved_at = snapshotIssue.issue.resolvedAt;
                            existingIssue.rejection_reason = snapshotIssue.issue.rejectionReason;
                            existingIssue.수정자설정한다(performedBy);
                            existingIssue.메타데이터업데이트한다(performedBy);

                            await manager.save(AttendanceIssue, existingIssue);
                            restoredIssueCount++;
                        } else {
                            // 기존 데이터가 없으면 새로 생성
                            await this.attendanceIssueService.생성한다(
                                {
                                    employeeId: snapshotIssue.employee_id,
                                    date: snapshotIssue.date,
                                    dailyEventSummaryId: dailySummary.id,
                                    problematicEnterTime: snapshotIssue.issue.problematicEnterTime || undefined,
                                    problematicLeaveTime: snapshotIssue.issue.problematicLeaveTime || undefined,
                                    correctedEnterTime: snapshotIssue.issue.correctedEnterTime || undefined,
                                    correctedLeaveTime: snapshotIssue.issue.correctedLeaveTime || undefined,
                                    problematicAttendanceTypeIds:
                                        snapshotIssue.issue.problematicAttendanceTypeIds || undefined,
                                    correctedAttendanceTypeIds:
                                        snapshotIssue.issue.correctedAttendanceTypeIds || undefined,
                                    description: snapshotIssue.issue.description || undefined,
                                },
                                manager,
                            );
                            restoredIssueCount++;
                        }
                    } catch (error) {
                        this.logger.error(
                            `이슈 복원 실패 (date=${snapshotIssue.date}, employeeId=${snapshotIssue.employee_id}): ${error.message}`,
                            error.stack,
                        );
                    }
                }

                // 7. 변경이력 복원 (ID로 기존 데이터 찾아서 복원 또는 새로 생성)
                let restoredHistoryCount = 0;
                for (const snapshotHistory of snapshotHistories) {
                    const key = `${snapshotHistory.date}_${snapshotHistory.employee_id}`;
                    const dailySummary = dailySummaryMap.get(key);
                    if (!dailySummary) {
                        continue;
                    }

                    try {
                        // 스냅샷 데이터에 원본 ID가 있는 경우, 기존 데이터 조회 (소프트 삭제된 것 포함)
                        let existingHistory: DailySummaryChangeHistory | null = null;
                        if (snapshotHistory.history.id) {
                            existingHistory = await manager.findOne(DailySummaryChangeHistory, {
                                where: { id: snapshotHistory.history.id },
                                withDeleted: true,
                            });
                        }

                        if (existingHistory) {
                            // 기존 데이터 복원 및 업데이트
                            existingHistory.deleted_at = null; // 복원
                            existingHistory.daily_event_summary_id = dailySummary.id;
                            existingHistory.date = snapshotHistory.date;
                            existingHistory.content = snapshotHistory.history.content;
                            existingHistory.changed_by = snapshotHistory.history.changedBy;
                            existingHistory.changed_at = snapshotHistory.history.changedAt;
                            existingHistory.reason = snapshotHistory.history.reason;
                            existingHistory.snapshot_id = snapshotId;
                            existingHistory.수정자설정한다(performedBy);
                            existingHistory.메타데이터업데이트한다(performedBy);

                            await manager.save(DailySummaryChangeHistory, existingHistory);
                            restoredHistoryCount++;
                        } else {
                            // 기존 데이터가 없으면 새로 생성
                            await this.dailySummaryChangeHistoryService.생성한다(
                                {
                                    dailyEventSummaryId: dailySummary.id,
                                    date: snapshotHistory.date,
                                    content: snapshotHistory.history.content,
                                    changedBy: snapshotHistory.history.changedBy,
                                    reason: snapshotHistory.history.reason || undefined,
                                    snapshotId: snapshotId,
                                },
                                manager,
                            );
                            restoredHistoryCount++;
                        }
                    } catch (error) {
                        this.logger.error(
                            `변경이력 복원 실패 (date=${snapshotHistory.date}, employeeId=${snapshotHistory.employee_id}): ${error.message}`,
                            error.stack,
                        );
                    }
                }

                // 8. 월간 요약 생성
                const monthlySummaryResult = await this.commandBus.execute(
                    new GenerateMonthlySummariesCommand({
                        year,
                        month,
                        performedBy,
                    }),
                );

                this.logger.log(
                    `스냅샷으로부터 복원 완료: snapshotId=${snapshotId}, daily=${dailySummaryResult.statistics.dailyEventSummaryCount}, monthly=${monthlySummaryResult.statistics.monthlyEventSummaryCount}, issues=${restoredIssueCount}, histories=${restoredHistoryCount}`,
                );

                return {
                    snapshotId,
                    year,
                    month,
                    restoredCount: {
                        monthlySummaryCount: monthlySummaryResult.statistics.monthlyEventSummaryCount,
                        dailySummaryCount: dailySummaryResult.statistics.dailyEventSummaryCount,
                    },
                };
            } catch (error) {
                this.logger.error(`스냅샷으로부터 복원 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
}
