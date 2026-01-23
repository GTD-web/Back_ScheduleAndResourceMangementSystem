import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateAttendanceIssuesCommand } from './create-attendance-issues.command';
import { DomainAttendanceIssueService } from '../../../../../domain/attendance-issue/attendance-issue.service';
import { DailyEventSummary } from '../../../../../domain/daily-event-summary/daily-event-summary.entity';
import { UsedAttendance } from '../../../../../domain/used-attendance/used-attendance.entity';

/**
 * 근태 이슈 생성 핸들러
 *
 * 정상근무 범위를 벗어난 경우 근태 이슈를 생성합니다.
 * 최초로 일간요약과 생성이 되었으면 그 다음부터는 생성되거나 업데이트되지 않게 함
 */
@CommandHandler(CreateAttendanceIssuesCommand)
export class CreateAttendanceIssuesHandler implements ICommandHandler<CreateAttendanceIssuesCommand, any[]> {
    private readonly logger = new Logger(CreateAttendanceIssuesHandler.name);

    constructor(
        private readonly attendanceIssueService: DomainAttendanceIssueService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: CreateAttendanceIssuesCommand): Promise<any[]> {
        const { summaries, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            return await this.근태이슈를생성한다(summaries, performedBy, manager);
        });
    }

    /**
     * 근태 이슈를 생성한다 (정상근무 범위를 벗어난 경우)
     *
     * 최초로 일간요약과 생성이 되었으면 그 다음부터는 생성되거나 업데이트되지 않게 함
     */
    private async 근태이슈를생성한다(
        summaries: DailyEventSummary[],
        performedBy: string,
        manager: any,
    ): Promise<any[]> {
        const issues: any[] = [];

        // 일괄 조회를 위해 모든 일간요약 ID 수집 (모든 summary 확인 필요)
        const summaryIds = summaries.map((s) => s.id);

        if (summaryIds.length === 0) {
            return issues;
        }

        // 이미 존재하는 이슈 조회 (일간요약 ID 기준)
        const existingIssues = await manager
            .createQueryBuilder('AttendanceIssue', 'ai')
            .where('ai.daily_event_summary_id IN (:...summaryIds)', { summaryIds })
            .andWhere('ai.deleted_at IS NULL')
            .getMany();

        const existingIssueMap = new Map<string, boolean>();
        existingIssues.forEach((issue) => {
            if (issue.daily_event_summary_id) {
                existingIssueMap.set(issue.daily_event_summary_id, true);
            }
        });

        // used_attendances 정보를 일괄 조회 (날짜 범위 기준)
        const dateSet = new Set(summaries.map((s) => s.date));
        const dateArray = Array.from(dateSet);
        const usedAttendancesMap = new Map<string, UsedAttendance[]>();

        if (dateArray.length > 0) {
            const minDate = dateArray.sort()[0];
            const maxDate = dateArray.sort().reverse()[0];
            const allUsedAttendances = await manager
                .createQueryBuilder('UsedAttendance', 'ua')
                .leftJoinAndSelect('ua.attendanceType', 'at')
                .where('ua.deleted_at IS NULL')
                .andWhere('ua.used_at >= :minDate', { minDate })
                .andWhere('ua.used_at <= :maxDate', { maxDate })
                .getMany();

            allUsedAttendances.forEach((ua) => {
                const key = `${ua.employee_id}_${ua.used_at}`;
                if (!usedAttendancesMap.has(key)) {
                    usedAttendancesMap.set(key, []);
                }
                usedAttendancesMap.get(key)!.push(ua);
            });
        }

        for (const summary of summaries) {
            // used_attendances에서 근태 유형 ID 추출 (최대 2개)
            const key = `${summary.employee_id}_${summary.date}`;
            const dayAttendances = usedAttendancesMap.get(key) || [];
            const problematicAttendanceTypeIds = dayAttendances
                .map((ua) => ua.attendance_type_id)
                .filter((id): id is string => !!id)
                .slice(0, 2); // 최대 2개

            // 이슈 생성 조건 확인
            // 1. 지각, 조퇴, 결근인 경우
            const isAttendanceIssue = summary.is_late || summary.is_early_leave || summary.is_absent;

            // 2. 근태사용내역에서 두 개의 근태가 있고, 시작시간과 종료시간이 동일한 경우
            let isDuplicateTimeIssue = false;
            if (dayAttendances.length === 2) {
                const [attendance1, attendance2] = dayAttendances;
                const startTime1 = attendance1.attendanceType?.start_work_time;
                const endTime1 = attendance1.attendanceType?.end_work_time;
                const startTime2 = attendance2.attendanceType?.start_work_time;
                const endTime2 = attendance2.attendanceType?.end_work_time;

                // 두 근태의 시작시간과 종료시간이 모두 동일한지 확인
                if (
                    startTime1 &&
                    endTime1 &&
                    startTime2 &&
                    endTime2 &&
                    startTime1 === startTime2 &&
                    endTime1 === endTime2
                ) {
                    isDuplicateTimeIssue = true;
                }
            }

            // 이슈 생성 조건에 해당하는 경우
            if (isAttendanceIssue || isDuplicateTimeIssue) {
                // 이미 해당 일간요약에 대한 이슈가 있으면 생성하지 않음
                if (existingIssueMap.has(summary.id)) {
                    continue;
                }

                try {
                    const issue = await this.attendanceIssueService.생성한다(
                        {
                            employeeId: summary.employee_id!,
                            date: summary.date,
                            dailyEventSummaryId: summary.id,
                            problematicEnterTime: summary.real_enter || summary.enter,
                            problematicLeaveTime: summary.real_leave || summary.leave,
                            correctedEnterTime: null,
                            correctedLeaveTime: null,
                            problematicAttendanceTypeIds:
                                problematicAttendanceTypeIds.length > 0 ? problematicAttendanceTypeIds : null,
                            correctedAttendanceTypeIds: null,
                            description: null, // 요청받은 직원이 직접 입력하는 부분
                        },
                        manager,
                    );
                    issues.push(issue);
                } catch (error: any) {
                    this.logger.warn(`근태 이슈 생성 실패 (${summary.date}, ${summary.employee_id}): ${error.message}`);
                }
            }
        }

        return issues;
    }
}
