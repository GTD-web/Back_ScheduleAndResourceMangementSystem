import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { GenerateDailySummariesCommand } from './generate-daily-summaries.command';
import { IGenerateDailySummariesResponse } from '../../../interfaces';
import { DomainDailyEventSummaryService } from '../../../../../domain/daily-event-summary/daily-event-summary.service';
import { DomainAttendanceIssueService } from '../../../../../domain/attendance-issue/attendance-issue.service';
import { DomainEventInfoService } from '../../../../../domain/event-info/event-info.service';
import { DomainUsedAttendanceService } from '../../../../../domain/used-attendance/used-attendance.service';
import { DomainHolidayInfoService } from '../../../../../domain/holiday-info/holiday-info.service';
import { DomainEmployeeService } from '@libs/modules/employee/employee.service';
import { WorkTimePolicyService } from '../../../services/work-time-policy.service';
import { EventInfo } from '../../../../../domain/event-info/event-info.entity';
import { UsedAttendance } from '../../../../../domain/used-attendance/used-attendance.entity';
import { DailyEventSummary } from '../../../../../domain/daily-event-summary/daily-event-summary.entity';
import { Employee } from '@libs/modules/employee/employee.entity';
import { format, startOfMonth, endOfMonth } from 'date-fns';

/**
 * 일일 요약 생성 핸들러
 *
 * flow.md의 두 가지 흐름을 지원합니다:
 *
 * 1. 파일내용반영 흐름 (snapshotData 없음):
 *    - event-info와 used-attendance를 기반으로 일일 요약 생성
 *    - 출입기록과 근태사용이력을 기반으로 계산
 *
 * 2. 스냅샷 적용 흐름 (snapshotData 제공):
 *    - 스냅샷에 저장된 데이터를 기반으로 일일 요약 생성
 *    - 기존 일일요약 데이터를 복원
 *
 * 공통:
 * - 정상근무 범위를 벗어난 경우 attendance-issue 데이터 생성
 * - 정상근무 범위는 정책적으로 변동될 여지가 있기때문에 유연하게 구현
 */
@CommandHandler(GenerateDailySummariesCommand)
export class GenerateDailySummariesHandler implements ICommandHandler<
    GenerateDailySummariesCommand,
    IGenerateDailySummariesResponse
> {
    private readonly logger = new Logger(GenerateDailySummariesHandler.name);

    constructor(
        private readonly dailyEventSummaryService: DomainDailyEventSummaryService,
        private readonly attendanceIssueService: DomainAttendanceIssueService,
        private readonly eventInfoService: DomainEventInfoService,
        private readonly usedAttendanceService: DomainUsedAttendanceService,
        private readonly holidayInfoService: DomainHolidayInfoService,
        private readonly employeeService: DomainEmployeeService,
        private readonly workTimePolicyService: WorkTimePolicyService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: GenerateDailySummariesCommand): Promise<IGenerateDailySummariesResponse> {
        const { year, month, performedBy, snapshotData } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                const isSnapshotMode = !!snapshotData;
                this.logger.log(
                    `일일 요약 생성 시작: year=${year}, month=${month}, 모드=${isSnapshotMode ? '스냅샷' : '일반'}`,
                );

                // 날짜 범위 계산 (소프트 삭제용)
                const yearNum = parseInt(year);
                const monthNum = parseInt(month);
                const startDate = startOfMonth(new Date(yearNum, monthNum - 1, 1));
                const endDate = endOfMonth(new Date(yearNum, monthNum - 1, 1));
                const startDateStr = format(startDate, 'yyyy-MM-dd');
                const endDateStr = format(endDate, 'yyyy-MM-dd');

                // 해당 연월의 모든 일간요약 소프트 삭제 (재반영 시 이전 데이터 제거)
                await this.해당연월일간요약소프트삭제(startDateStr, endDateStr, performedBy, manager);

                let summaries: DailyEventSummary[];

                if (isSnapshotMode) {
                    // 스냅샷 적용 흐름: 스냅샷 데이터를 기반으로 생성 (모든 데이터 사용)
                    summaries = await this.스냅샷기반일일요약생성(snapshotData!, year, month, manager);
                } else {
                    // 파일내용반영 흐름: event-info와 used-attendance를 기반으로 생성
                    // 1. event-info와 used-attendance 가져오기 (날짜 범위만으로 조회)
                    const events = await this.이벤트정보를조회한다(startDateStr, endDateStr, manager);
                    const usedAttendances = await this.근태사용내역을조회한다(startDateStr, endDateStr, manager);

                    // 2. 조회된 데이터에서 직원 정보 추출 및 조회
                    const { employees, employeeNumberMap } = await this.직원정보를추출한다(
                        events,
                        usedAttendances,
                        manager,
                    );

                    if (employees.length === 0) {
                        this.logger.warn('조회된 직원이 없습니다.');
                        return {
                            success: true,
                            statistics: {
                                dailyEventSummaryCount: 0,
                                attendanceIssueCount: 0,
                            },
                        };
                    }

                    // 3. holiday 정보 가져오기
                    const holidays = await this.holidayInfoService.목록조회한다();
                    const holidaySet = new Set(holidays.map((h) => h.holidayDate));

                    // 4. daily-event-summary 생성
                    summaries = await this.일일요약을생성한다(
                        events,
                        usedAttendances,
                        employees,
                        employeeNumberMap,
                        holidaySet,
                        year,
                        month,
                        manager,
                    );
                }

                // 7. attendance-issue 생성 (정상근무 범위를 벗어난 경우)
                const issues = await this.근태이슈를생성한다(summaries, performedBy, manager);

                this.logger.log(`✅ 일일 요약 생성 완료: 요약 ${summaries.length}건, 이슈 ${issues.length}건`);

                return {
                    success: true,
                    statistics: {
                        dailyEventSummaryCount: summaries.length,
                        attendanceIssueCount: issues.length,
                    },
                };
            } catch (error) {
                this.logger.error(`일일 요약 생성 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }

    /**
     * 이벤트 정보를 조회한다 (날짜 범위만으로 조회)
     */
    private async 이벤트정보를조회한다(startDate: string, endDate: string, manager: any): Promise<EventInfo[]> {
        // 날짜를 YYYYMMDD 형식으로 변환
        const startDateNum = parseInt(startDate.replace(/-/g, ''));
        const endDateNum = parseInt(endDate.replace(/-/g, ''));

        return await manager
            .createQueryBuilder(EventInfo, 'ei')
            .where('ei.yyyymmdd >= :startDateNum', { startDateNum })
            .andWhere('ei.yyyymmdd <= :endDateNum', { endDateNum })
            .andWhere('ei.deleted_at IS NULL')
            .getMany();
    }

    /**
     * 근태 사용 내역을 조회한다 (날짜 범위만으로 조회)
     */
    private async 근태사용내역을조회한다(startDate: string, endDate: string, manager: any): Promise<UsedAttendance[]> {
        const usedAttendances = await manager
            .createQueryBuilder(UsedAttendance, 'ua')
            .leftJoinAndSelect('ua.attendanceType', 'at')
            .where('ua.deleted_at IS NULL')
            .andWhere('ua.used_at >= :startDate', { startDate })
            .andWhere('ua.used_at <= :endDate', { endDate })
            .getMany();
        return usedAttendances;
    }

    /**
     * 조회된 데이터에서 직원 정보를 추출한다
     */
    private async 직원정보를추출한다(
        events: EventInfo[],
        usedAttendances: any[],
        manager: any,
    ): Promise<{
        employees: Employee[];
        employeeNumberMap: Map<string, Employee>;
    }> {
        // 1. 출입기록에서 employeeNumber 추출
        const employeeNumbers = new Set<string>();
        events.forEach((event) => {
            if (event.employee_number) {
                employeeNumbers.add(event.employee_number);
            }
        });

        // 2. 근태사용내역에서 employeeId 추출
        const employeeIds = new Set<string>();
        usedAttendances.forEach((ua) => {
            if (ua.employeeId) {
                employeeIds.add(ua.employeeId);
            }
        });

        // 3. employeeNumber로 직원 조회
        const employeesByNumber =
            employeeNumbers.size > 0
                ? await manager.find(Employee, {
                      where: { employeeNumber: In(Array.from(employeeNumbers)) },
                  })
                : [];

        // 4. employeeId로 직원 조회
        const employeesById =
            employeeIds.size > 0
                ? await manager.find(Employee, {
                      where: { id: In(Array.from(employeeIds)) },
                  })
                : [];

        // 5. 두 결과를 합치고 중복 제거
        const employeeMap = new Map<string, Employee>();
        employeesByNumber.forEach((emp) => employeeMap.set(emp.id, emp));
        employeesById.forEach((emp) => employeeMap.set(emp.id, emp));

        const employees = Array.from(employeeMap.values());
        const employeeNumberMap = new Map(employees.map((emp) => [emp.employeeNumber, emp]));

        return { employees, employeeNumberMap };
    }

    /**
     * 일일 요약을 생성한다
     */
    private async 일일요약을생성한다(
        events: EventInfo[],
        usedAttendances: UsedAttendance[],
        employees: Employee[],
        employeeNumberMap: Map<string, Employee>,
        holidaySet: Set<string>,
        year: string,
        month: string,
        manager: any,
    ): Promise<DailyEventSummary[]> {
        // 해당 월의 모든 날짜 생성
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0);
        const allDates = this.날짜범위생성(startDate, endDate);

        // 직원별, 날짜별로 이벤트 그룹화
        const eventsByEmployeeAndDate = new Map<string, Map<string, EventInfo[]>>();
        events.forEach((event) => {
            if (!event.employee_number || !employeeNumberMap.has(event.employee_number)) return;

            const employee = employeeNumberMap.get(event.employee_number)!;
            if (!eventsByEmployeeAndDate.has(employee.id)) {
                eventsByEmployeeAndDate.set(employee.id, new Map());
            }

            const employeeEvents = eventsByEmployeeAndDate.get(employee.id)!;
            const dateStr = event.yyyymmdd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
            if (!employeeEvents.has(dateStr)) {
                employeeEvents.set(dateStr, []);
            }

            employeeEvents.get(dateStr)!.push(event);
        });

        // 직원별, 날짜별 근태 이력 그룹화
        const attendancesByEmployeeAndDate = new Map<string, Map<string, UsedAttendance[]>>();
        usedAttendances.forEach((ua) => {
            const employeeId = ua.employee_id;
            if (!employeeId) return;

            if (!attendancesByEmployeeAndDate.has(employeeId)) {
                attendancesByEmployeeAndDate.set(employeeId, new Map());
            }
            const employeeAttendances = attendancesByEmployeeAndDate.get(employeeId)!;
            if (!employeeAttendances.has(ua.used_at)) {
                employeeAttendances.set(ua.used_at, []);
            }
            employeeAttendances.get(ua.used_at)!.push(ua);
        });

        // DailyEventSummary 생성
        const summaries: DailyEventSummary[] = [];

        // 모든 직원 × 모든 날짜 조합 생성
        for (const employee of employees) {
            const employeeEvents = eventsByEmployeeAndDate.get(employee.id);
            const employeeAttendances = attendancesByEmployeeAndDate.get(employee.id);

            for (const date of allDates) {
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayEvents = employeeEvents?.get(dateStr);
                const dayAttendances = employeeAttendances?.get(dateStr) || [];

                const summary = new DailyEventSummary(
                    dateStr,
                    employee.id,
                    undefined,
                    holidaySet.has(dateStr) || this.주말여부확인(dateStr),
                );

                // 입사일 및 퇴사일 확인
                const hireDate = employee.hireDate ? format(new Date(employee.hireDate), 'yyyy-MM-dd') : null;
                const terminationDate =
                    employee.status === '퇴사' && employee.terminationDate
                        ? format(new Date(employee.terminationDate), 'yyyy-MM-dd')
                        : null;
                const isBeforeHireDate = hireDate && dateStr < hireDate;
                const isAfterTerminationDate = terminationDate && dateStr > terminationDate;

                // 1단계: 출입 기록 정보 반영
                let realEnterTime: string | null = null;
                let realLeaveTime: string | null = null;
                if (dayEvents && dayEvents.length > 0) {
                    dayEvents.sort((a, b) => a.hhmmss.localeCompare(b.hhmmss));
                    realEnterTime = this.HHMMSS를HHMMSS로변환(dayEvents[0].hhmmss);
                    realLeaveTime = this.HHMMSS를HHMMSS로변환(dayEvents[dayEvents.length - 1].hhmmss);

                    // 실제 출입 기록은 항상 유지
                    summary.real_enter = realEnterTime;
                    summary.real_leave = realLeaveTime;
                }

                // 2단계: 출입 기록과 근태 유형을 종합하여 출퇴근 시간 계산
                // 정상 근무로 인정되는 근태만 필터링
                const recognizedAttendances = dayAttendances.filter((ua) =>
                    this.workTimePolicyService.isRecognizedWorkTime(ua.attendanceType),
                );

                const workTime = this.출입기록과근태기반출입시간을계산한다(
                    realEnterTime,
                    realLeaveTime,
                    recognizedAttendances,
                );

                summary.enter = workTime.enter;
                summary.leave = workTime.leave;

                // 3단계: 결근 판정
                if (isBeforeHireDate || isAfterTerminationDate) {
                    summary.is_absent = false;
                } else if (summary.is_holiday) {
                    summary.is_absent = false;
                } else if (recognizedAttendances.length > 0 || (dayEvents && dayEvents.length > 0)) {
                    // 인정되는 근태가 있거나 출입 기록이 있으면 결근 아님
                    summary.is_absent = false;
                } else {
                    summary.is_absent = true;
                }

                // 4단계: 지각/조퇴 판정 (출입 기록이 있는 경우에만)
                if (dayEvents && dayEvents.length > 0) {
                    const hasMorningRecognized = this.workTimePolicyService.hasMorningRecognized(recognizedAttendances);
                    const hasAfternoonRecognized =
                        this.workTimePolicyService.hasAfternoonRecognized(recognizedAttendances);

                    const earliestHHMMSS = dayEvents[0].hhmmss;
                    const latestHHMMSS = dayEvents[dayEvents.length - 1].hhmmss;

                    summary.is_late = this.workTimePolicyService.isLate(
                        earliestHHMMSS,
                        hasMorningRecognized,
                        summary.is_holiday,
                        isBeforeHireDate,
                        isAfterTerminationDate,
                    );

                    summary.is_early_leave = this.workTimePolicyService.isEarlyLeave(
                        latestHHMMSS,
                        hasAfternoonRecognized,
                        summary.is_holiday,
                        isBeforeHireDate,
                        isAfterTerminationDate,
                    );
                }

                summary.is_checked = true;
                summary.note = '';

                // 해당 날짜에 사용된 근태 유형 정보 설정
                const usedAttendanceInfos = dayAttendances.map((ua) => {
                    const attendanceType = ua.attendanceType;
                    return {
                        attendanceTypeId: ua.attendance_type_id,
                        title: attendanceType?.title || '',
                        workTime: attendanceType?.work_time,
                        isRecognizedWorkTime: attendanceType?.is_recognized_work_time,
                        startWorkTime: attendanceType?.start_work_time || null,
                        endWorkTime: attendanceType?.end_work_time || null,
                        deductedAnnualLeave: attendanceType?.deducted_annual_leave,
                    };
                });
                summary.used_attendances = usedAttendanceInfos.length > 0 ? usedAttendanceInfos : null;

                summaries.push(summary);
            }
        }

        // 기존 데이터 조회 (소프트 삭제된 데이터 포함)
        const existingDateStartStr = format(startDate, 'yyyy-MM-dd');
        const existingDateEndStr = format(endDate, 'yyyy-MM-dd');
        const existingSummaries = await manager
            .createQueryBuilder(DailyEventSummary, 'des')
            .where('des.date >= :startDate', { startDate: existingDateStartStr })
            .andWhere('des.date <= :endDate', { endDate: existingDateEndStr })
            .withDeleted() // 소프트 삭제된 데이터도 조회
            .getMany();

        const existingMap = new Map<string, DailyEventSummary>();
        existingSummaries.forEach((existing) => {
            const key = `${existing.date}_${existing.employee_id}`;
            existingMap.set(key, existing);
        });

        // 복원 및 생성 데이터 분리
        const toSave: DailyEventSummary[] = [];
        summaries.forEach((summary) => {
            const key = `${summary.date}_${summary.employee_id}`;
            const existing = existingMap.get(key);

            if (existing) {
                // 기존 데이터 복원 및 업데이트
                existing.deleted_at = null; // 소프트 삭제 해제
                existing.enter = summary.enter;
                existing.leave = summary.leave;
                existing.real_enter = summary.real_enter;
                existing.real_leave = summary.real_leave;
                existing.is_holiday = summary.is_holiday;
                existing.is_absent = summary.is_absent;
                existing.is_late = summary.is_late;
                existing.is_early_leave = summary.is_early_leave;
                existing.is_checked = summary.is_checked;
                existing.note = summary.note;
                existing.work_time = summary.work_time;
                existing.used_attendances = summary.used_attendances;
                toSave.push(existing);
            } else {
                // 새 데이터 생성
                toSave.push(summary);
            }
        });

        // 배치 저장
        const SUMMARY_BATCH_SIZE = 1000;
        for (let i = 0; i < toSave.length; i += SUMMARY_BATCH_SIZE) {
            const batch = toSave.slice(i, i + SUMMARY_BATCH_SIZE);
            await manager.save(DailyEventSummary, batch);
        }

        return toSave;
    }

    /**
     * 근태 이슈를 생성한다 (정상근무 범위를 벗어난 경우)
     */
    private async 근태이슈를생성한다(
        summaries: DailyEventSummary[],
        performedBy: string,
        manager: any,
    ): Promise<any[]> {
        const issues: any[] = [];

        for (const summary of summaries) {
            // 지각, 조퇴, 결근인 경우 이슈 생성
            if (summary.is_late || summary.is_early_leave || summary.is_absent) {
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
                            problematicAttendanceTypeId: null,
                            correctedAttendanceTypeId: null,
                            description: this.이슈설명생성(summary),
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

    /**
     * 이슈 설명을 생성한다
     */
    private 이슈설명생성(summary: DailyEventSummary): string {
        const descriptions: string[] = [];
        if (summary.is_late) descriptions.push('지각');
        if (summary.is_early_leave) descriptions.push('조퇴');
        if (summary.is_absent) descriptions.push('결근');
        return descriptions.join(', ');
    }

    /**
     * 날짜 범위 생성
     */
    private 날짜범위생성(start: Date, end: Date): Date[] {
        const dates: Date[] = [];
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            dates.push(new Date(date));
        }
        return dates;
    }

    /**
     * 주말 여부 확인
     */
    private 주말여부확인(dateString: string): boolean {
        const date = new Date(dateString);
        return date.getDay() === 0 || date.getDay() === 6;
    }

    /**
     * 출입 기록과 근태 유형을 종합하여 출퇴근 시간을 계산한다
     *
     * 정책: 실제 출입 기록과 근태 유형에 정해진 출퇴근 시간들 중
     * 가장 이른 시간과 가장 늦은 시간으로 출퇴근 시간을 입력
     *
     * @param realEnterTime 실제 출입 기록의 출근 시간 (HH:MM:SS 형식 또는 null)
     * @param realLeaveTime 실제 출입 기록의 퇴근 시간 (HH:MM:SS 형식 또는 null)
     * @param recognizedAttendances 인정되는 근태 사용 내역 목록
     * @returns 출입 시간 정보 (enter, leave)
     */
    private 출입기록과근태기반출입시간을계산한다(
        realEnterTime: string | null,
        realLeaveTime: string | null,
        recognizedAttendances: UsedAttendance[],
    ): {
        enter: string | null;
        leave: string | null;
    } {
        // 시간 비교를 위한 함수 (HH:MM:SS 형식)
        const compareTime = (time1: string, time2: string): number => {
            return time1.localeCompare(time2);
        };

        // 출근 시간 후보 목록
        const enterTimeCandidates: string[] = [];
        if (realEnterTime) {
            enterTimeCandidates.push(realEnterTime);
        }

        // 근태 유형에서 출근 시간 추출
        recognizedAttendances.forEach((ua) => {
            const attendanceType = ua.attendanceType;
            if (attendanceType?.start_work_time) {
                // HH:MM 형식인 경우 HH:MM:00 형식으로 변환
                // 이미 HH:MM:SS 형식인 경우 그대로 사용
                const startTime =
                    attendanceType.start_work_time.length === 5
                        ? attendanceType.start_work_time + ':00'
                        : attendanceType.start_work_time;
                enterTimeCandidates.push(startTime);
            }
        });

        // 퇴근 시간 후보 목록
        const leaveTimeCandidates: string[] = [];
        if (realLeaveTime) {
            leaveTimeCandidates.push(realLeaveTime);
        }

        // 근태 유형에서 퇴근 시간 추출
        recognizedAttendances.forEach((ua) => {
            const attendanceType = ua.attendanceType;
            if (attendanceType?.end_work_time) {
                // HH:MM 형식인 경우 HH:MM:00 형식으로 변환
                // 이미 HH:MM:SS 형식인 경우 그대로 사용
                const endTime =
                    attendanceType.end_work_time.length === 5
                        ? attendanceType.end_work_time + ':00'
                        : attendanceType.end_work_time;
                leaveTimeCandidates.push(endTime);
            }
        });

        // 가장 이른 출근 시간 선택
        let enterTime: string | null = null;
        if (enterTimeCandidates.length > 0) {
            enterTimeCandidates.sort(compareTime);
            enterTime = enterTimeCandidates[0];
        }

        // 가장 늦은 퇴근 시간 선택
        let leaveTime: string | null = null;
        if (leaveTimeCandidates.length > 0) {
            leaveTimeCandidates.sort(compareTime);
            leaveTime = leaveTimeCandidates[leaveTimeCandidates.length - 1];
        }

        return {
            enter: enterTime,
            leave: leaveTime,
        };
    }

    /**
     * 인정되는 근태를 기반으로 출입 시간을 계산한다
     *
     * 정책에 따라 다음 우선순위로 출입 시간을 결정합니다:
     * 1. 오전과 오후 모두 인정되는 경우 (여러 근태 유형 조합 포함) → 하루 종일 근무
     * 2. 하루 종일 인정되는 단일 근태 유형이 있는 경우 → 하루 종일 근무
     * 3. 부분 인정되는 경우 (오전만 또는 오후만) → 해당 시간대만 설정
     *
     * 정책 변경 시 WorkTimePolicyService만 수정하면 됩니다.
     *
     * @param dayAttendances 해당 날짜의 근태 사용 내역 목록
     * @returns 출입 시간 정보 (enter, leave)
     */
    private 인정근태기반출입시간을계산한다(dayAttendances: UsedAttendance[]): {
        enter: string | null;
        leave: string | null;
    } {
        // 정책 서비스를 통해 근태 인정 여부 확인
        const hasMorningRecognized = this.workTimePolicyService.hasMorningRecognized(dayAttendances);
        const hasAfternoonRecognized = this.workTimePolicyService.hasAfternoonRecognized(dayAttendances);
        const hasFullDayAttendance = this.workTimePolicyService.hasFullDayRecognized(dayAttendances);

        // 정상 근무 시간을 정책 서비스에서 가져옴
        const normalStartTime = this.workTimePolicyService.getNormalWorkStartTime();
        const normalEndTime = this.workTimePolicyService.getNormalWorkEndTime();

        // HH:MM:SS 형식을 HH:MM:00 형식으로 변환
        const formatTime = (time: string): string => {
            return time.substring(0, 5) + ':00';
        };

        // 1. 오전과 오후 모두 인정되는 경우 하루 종일 근무로 처리
        // (여러 근태 유형 조합으로 하루 종일을 구성하는 경우 포함)
        if (hasMorningRecognized && hasAfternoonRecognized) {
            return {
                enter: formatTime(normalStartTime),
                leave: formatTime(normalEndTime),
            };
        }

        // 2. 하루 종일 인정되는 단일 근태 유형이 있는 경우
        if (hasFullDayAttendance) {
            return {
                enter: formatTime(normalStartTime),
                leave: formatTime(normalEndTime),
            };
        }

        // 3. 부분 인정되는 경우 (오전만 또는 오후만)
        return {
            enter: hasMorningRecognized ? formatTime(normalStartTime) : null,
            leave: hasAfternoonRecognized ? formatTime(normalEndTime) : null,
        };
    }

    /**
     * HHMMSS 형식을 HH:MM:SS 형식으로 변환한다
     */
    private HHMMSS를HHMMSS로변환(hhmmss: string): string {
        if (!hhmmss || hhmmss.length !== 6) {
            return hhmmss;
        }
        return `${hhmmss.substring(0, 2)}:${hhmmss.substring(2, 4)}:${hhmmss.substring(4, 6)}`;
    }

    /**
     * 해당 연월의 모든 일간요약을 소프트 삭제한다
     *
     * 재반영 시 이전 데이터를 제거하기 위해 사용됩니다.
     * 조회된 직원 목록과 이전에 적용되어 있던 직원 목록이 달라질 수 있기 때문에
     * 해당 연월의 모든 요약 데이터를 소프트 삭제한 후 새로 생성합니다.
     *
     * @param startDate 시작 날짜 (yyyy-MM-dd)
     * @param endDate 종료 날짜 (yyyy-MM-dd)
     * @param performedBy 수행자 ID
     * @param manager EntityManager
     */
    private async 해당연월일간요약소프트삭제(
        startDate: string,
        endDate: string,
        performedBy: string,
        manager: any,
    ): Promise<void> {
        const existingSummaries = await manager
            .createQueryBuilder(DailyEventSummary, 'des')
            .where('des.deleted_at IS NULL')
            .andWhere('des.date >= :startDate', { startDate })
            .andWhere('des.date <= :endDate', { endDate })
            .getMany();

        if (existingSummaries.length === 0) {
            return;
        }

        const now = new Date();
        for (const summary of existingSummaries) {
            summary.deleted_at = now;
            summary.수정자설정한다(performedBy);
            summary.메타데이터업데이트한다(performedBy);
        }

        await manager.save(DailyEventSummary, existingSummaries);
        this.logger.log(`해당 연월 일간요약 소프트 삭제 완료: ${existingSummaries.length}건`);
    }

    /**
     * 스냅샷 데이터를 기반으로 일일 요약을 생성한다
     *
     * flow.md의 "스냅샷 적용 흐름"에 해당
     * - 스냅샷에 저장된 모든 데이터를 기반으로 일일 요약 생성
     * - 기존 일일요약 데이터를 복원
     */
    private async 스냅샷기반일일요약생성(
        snapshotData: {
            dailyEventSummaries: Array<{
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
                used_attendances?: Array<{
                    attendanceTypeId: string;
                    title: string;
                    workTime?: number;
                    isRecognizedWorkTime?: boolean;
                    startWorkTime?: string | null;
                    endWorkTime?: string | null;
                    deductedAnnualLeave?: number;
                }> | null;
            }>;
        },
        year: string,
        month: string,
        manager: any,
    ): Promise<DailyEventSummary[]> {
        const summaries: DailyEventSummary[] = [];

        // 스냅샷 데이터를 기반으로 DailyEventSummary 생성 (모든 데이터 사용)
        for (const snapshot of snapshotData.dailyEventSummaries) {
            // 날짜 필터링 (해당 연월만)
            const dateYear = snapshot.date.substring(0, 4);
            const dateMonth = snapshot.date.substring(5, 7);
            if (dateYear !== year || dateMonth !== month) {
                continue;
            }

            const summary = new DailyEventSummary(
                snapshot.date,
                snapshot.employee_id,
                undefined, // monthly_event_summary_id는 나중에 설정
                snapshot.is_holiday,
                snapshot.enter,
                snapshot.leave,
                snapshot.real_enter,
                snapshot.real_leave,
                snapshot.is_checked,
                snapshot.is_late,
                snapshot.is_early_leave,
                snapshot.is_absent,
                snapshot.work_time,
                snapshot.note,
                snapshot.used_attendances,
            );

            summaries.push(summary);
        }

        // 기존 데이터 조회 (소프트 삭제된 데이터 포함)
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const startDate = startOfMonth(new Date(yearNum, monthNum - 1, 1));
        const endDate = endOfMonth(new Date(yearNum, monthNum - 1, 1));
        const startDateStr = format(startDate, 'yyyy-MM-dd');
        const endDateStr = format(endDate, 'yyyy-MM-dd');

        const existingSummaries = await manager
            .createQueryBuilder(DailyEventSummary, 'des')
            .where('des.date >= :startDate', { startDate: startDateStr })
            .andWhere('des.date <= :endDate', { endDate: endDateStr })
            .withDeleted() // 소프트 삭제된 데이터도 조회
            .getMany();

        const existingMap = new Map<string, DailyEventSummary>();
        existingSummaries.forEach((existing) => {
            const key = `${existing.date}_${existing.employee_id}`;
            existingMap.set(key, existing);
        });

        // 복원 및 생성 데이터 분리
        const toSave: DailyEventSummary[] = [];
        summaries.forEach((summary) => {
            const key = `${summary.date}_${summary.employee_id}`;
            const existing = existingMap.get(key);

            if (existing) {
                // 기존 데이터 복원 및 업데이트
                existing.deleted_at = null; // 소프트 삭제 해제
                existing.enter = summary.enter;
                existing.leave = summary.leave;
                existing.real_enter = summary.real_enter;
                existing.real_leave = summary.real_leave;
                existing.is_holiday = summary.is_holiday;
                existing.is_absent = summary.is_absent;
                existing.is_late = summary.is_late;
                existing.is_early_leave = summary.is_early_leave;
                existing.is_checked = summary.is_checked;
                existing.note = summary.note;
                existing.work_time = summary.work_time;
                existing.used_attendances = summary.used_attendances;
                toSave.push(existing);
            } else {
                // 새 데이터 생성
                toSave.push(summary);
            }
        });

        // 배치 저장
        const SUMMARY_BATCH_SIZE = 1000;
        for (let i = 0; i < toSave.length; i += SUMMARY_BATCH_SIZE) {
            const batch = toSave.slice(i, i + SUMMARY_BATCH_SIZE);
            await manager.save(DailyEventSummary, batch);
        }

        return toSave;
    }
}
