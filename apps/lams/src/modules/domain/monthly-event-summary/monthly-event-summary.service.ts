import { Injectable, Logger } from '@nestjs/common';
import { DomainMonthlyEventSummaryRepository } from './monthly-event-summary.repository';
import { MonthlyEventSummary } from './monthly-event-summary.entity';
import { DataSource } from 'typeorm';
import { DailyEventSummary } from '../daily-event-summary/daily-event-summary.entity';
import { UsedAttendance } from '../used-attendance/used-attendance.entity';
import { DomainAttendanceTypeService } from '../attendance-type/attendance-type.service';
import { startOfMonth, endOfMonth, format, getWeek, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

@Injectable()
export class DomainMonthlyEventSummaryService {
    private readonly logger = new Logger(DomainMonthlyEventSummaryService.name);

    constructor(
        private readonly repository: DomainMonthlyEventSummaryRepository,
        private readonly dataSource: DataSource,
        private readonly attendanceTypeService: DomainAttendanceTypeService,
    ) {}

    /**
     * 월간 요약 생성 또는 갱신 (배치 최적화 버전 - 이미 조회된 데이터 사용)
     */
    async generateOrUpdateMonthlySummaryBatch(
        employeeId: string,
        yyyymm: string,
        dailySummaries: DailyEventSummary[],
        usedAttendances: any[],
        allAttendanceTypes: any[],
        queryRunner: any,
    ): Promise<any> {
        try {
            const [year, month] = yyyymm.split('-');

            if (dailySummaries.length === 0) {
                throw new Error(`${yyyymm}의 일일 요약 데이터가 없습니다.`);
            }

            // 통계 계산 (뷰 로직과 동기화)
            const workDays = dailySummaries.filter((d) => {
                if (d.workTime !== null) return true;

                const hasRecognizedAttendance = usedAttendances.some(
                    (ua) => ua.usedAt === d.date && ua.attendanceType?.isRecognizedWorkTime === true,
                );
                return hasRecognizedAttendance;
            });

            // 주간 근무시간 요약 계산
            const weeklyWorkTimeSummary = this.calculateWeeklyWorkTime(dailySummaries, usedAttendances, year, month);
            const totalWorkTime = weeklyWorkTimeSummary.reduce((sum, week) => sum + week.weeklyWorkTime, 0);

            // totalWorkableTime 계산
            const monthStart = startOfMonth(new Date(`${year}-${month}-01`));
            const monthEnd = endOfMonth(new Date(`${year}-${month}-01`));
            const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
            const weekdayCount = allDays.filter((day) => {
                const dow = day.getDay();
                return dow !== 0 && dow !== 6;
            }).length;
            const totalWorkableTime = weekdayCount * 624;

            const avgWorkTimes = workDays.length > 0 ? totalWorkTime / workDays.length : 0;

            // 근태 유형별 카운트 (전달받은 allAttendanceTypes 사용)
            const attendanceTypeCount: { [key: string]: number } = {};

            allAttendanceTypes.forEach((at) => {
                attendanceTypeCount[at.title] = 0;
            });

            attendanceTypeCount['지각'] = 0;
            attendanceTypeCount['결근'] = 0;
            attendanceTypeCount['조퇴'] = 0;

            usedAttendances.forEach((ua) => {
                const title = ua.attendanceType?.title;
                if (title && title in attendanceTypeCount) {
                    attendanceTypeCount[title]++;
                }
            });

            dailySummaries.forEach((d) => {
                if (d.isLate) attendanceTypeCount['지각']++;
                if (d.isAbsent) attendanceTypeCount['결근']++;
                if (d.isEarlyLeave) attendanceTypeCount['조퇴']++;
            });

            // 상세 정보
            const dailyEventSummary = dailySummaries.map((d) => ({
                dailyEventSummaryId: d.dailyEventSummaryId,
                date: d.date,
                isHoliday: d.isHoliday,
                enter: d.enter,
                leave: d.leave,
                realEnter: d.realEnter,
                realLeave: d.realLeave,
                isChecked: d.isChecked,
                isLate: d.isLate,
                isEarlyLeave: d.isEarlyLeave,
                isAbsent: d.isAbsent,
                workTime: d.workTime,
                note: d.note || '',
                usedAttendances: usedAttendances
                    .filter((ua) => ua.usedAt === d.date)
                    .map((ua) => ({
                        usedAttendanceId: ua.usedAttendanceId,
                        attendanceTypeId: ua.attendanceType?.attendanceTypeId,
                        title: ua.attendanceType?.title,
                    })),
            }));

            const lateDetails = dailySummaries
                .filter((d) => d.isLate)
                .map((d) => ({
                    dailyEventSummaryId: d.dailyEventSummaryId,
                    date: d.date,
                    isHoliday: d.isHoliday,
                    enter: d.enter,
                    leave: d.leave,
                    realEnter: d.realEnter,
                    realLeave: d.realLeave,
                    isChecked: d.isChecked,
                    isLate: d.isLate,
                    isEarlyLeave: d.isEarlyLeave,
                    isAbsent: d.isAbsent,
                    workTime: d.workTime,
                    note: d.note || '',
                    usedAttendances: usedAttendances
                        .filter((ua) => ua.usedAt === d.date)
                        .map((ua) => ({
                            usedAttendanceId: ua.usedAttendanceId,
                            attendanceTypeId: ua.attendanceType?.attendanceTypeId,
                            title: ua.attendanceType?.title,
                        })),
                }));

            const absenceDetails = dailySummaries
                .filter((d) => d.isAbsent)
                .map((d) => ({
                    dailyEventSummaryId: d.dailyEventSummaryId,
                    date: d.date,
                    isHoliday: d.isHoliday,
                    enter: d.enter,
                    leave: d.leave,
                    realEnter: d.realEnter,
                    realLeave: d.realLeave,
                    isChecked: d.isChecked,
                    isLate: d.isLate,
                    isEarlyLeave: d.isEarlyLeave,
                    isAbsent: d.isAbsent,
                    workTime: d.workTime,
                    note: d.note || '',
                    usedAttendances: usedAttendances
                        .filter((ua) => ua.usedAt === d.date)
                        .map((ua) => ({
                            usedAttendanceId: ua.usedAttendanceId,
                            attendanceTypeId: ua.attendanceType?.attendanceTypeId,
                            title: ua.attendanceType?.title,
                        })),
                }));

            const earlyLeaveDetails = dailySummaries
                .filter((d) => d.isEarlyLeave)
                .map((d) => ({
                    dailyEventSummaryId: d.dailyEventSummaryId,
                    date: d.date,
                    isHoliday: d.isHoliday,
                    enter: d.enter,
                    leave: d.leave,
                    realEnter: d.realEnter,
                    realLeave: d.realLeave,
                    isChecked: d.isChecked,
                    isLate: d.isLate,
                    isEarlyLeave: d.isEarlyLeave,
                    isAbsent: d.isAbsent,
                    workTime: d.workTime,
                    note: d.note || '',
                    usedAttendances: usedAttendances
                        .filter((ua) => ua.usedAt === d.date)
                        .map((ua) => ({
                            usedAttendanceId: ua.usedAttendanceId,
                            attendanceTypeId: ua.attendanceType?.attendanceTypeId,
                            title: ua.attendanceType?.title,
                        })),
                }));

            // 기존 요약 찾기
            let summary = await this.repository.findOneByEmployeeIdAndYearMonth(employeeId, yyyymm);

            if (!summary) {
                summary = new MonthlyEventSummary();
                summary.employeeId = employeeId;
                summary.employeeNumber = dailySummaries[0].employee.employeeNumber;
                summary.employeeName = dailySummaries[0].employee.name;
                summary.yyyymm = yyyymm;
            }

            // 데이터 업데이트
            summary.employeeNumber = dailySummaries[0].employee.employeeNumber;
            summary.employeeName = dailySummaries[0].employee.name;
            summary.workDaysCount = workDays.length;
            summary.totalWorkableTime = totalWorkableTime;
            summary.totalWorkTime = totalWorkTime;
            summary.avgWorkTimes = avgWorkTimes;
            summary.attendanceTypeCount = attendanceTypeCount;
            summary.weeklyWorkTimeSummary = weeklyWorkTimeSummary;
            summary.dailyEventSummary = dailyEventSummary;
            summary.lateDetails = lateDetails;
            summary.absenceDetails = absenceDetails;
            summary.earlyLeaveDetails = earlyLeaveDetails;

            await queryRunner.manager.save(MonthlyEventSummary, summary);

            return summary;
        } catch (error) {
            this.logger.error(`월간 요약 생성 실패 (배치): ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * 주간 근무시간 계산 (뷰 로직과 동기화)
     */
    private calculateWeeklyWorkTime(
        dailySummaries: DailyEventSummary[],
        usedAttendances: UsedAttendance[],
        year: string,
        month: string,
    ): Array<{
        weekNumber: number;
        startDate: string;
        endDate: string;
        weeklyWorkTime: number;
    }> {
        const monthStart = startOfMonth(new Date(`${year}-${month}-01`));
        const monthEnd = endOfMonth(new Date(`${year}-${month}-01`));
        const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

        // 주차별로 그룹화
        const weekGroups = new Map<number, { dates: string[]; workTime: number }>();

        allDays.forEach((day) => {
            const weekNumber = getWeek(day);
            const dateStr = format(day, 'yyyy-MM-dd');

            if (!weekGroups.has(weekNumber)) {
                weekGroups.set(weekNumber, { dates: [], workTime: 0 });
            }

            const group = weekGroups.get(weekNumber)!;
            group.dates.push(dateStr);

            // 해당 날짜의 근무시간 찾기 (뷰 로직과 동일)
            const dailySummary = dailySummaries.find((d) => d.date === dateStr);
            const dayAttendances = usedAttendances.filter((ua) => ua.usedAt === dateStr);
            const totalAttendanceWorkTime = dayAttendances.reduce(
                (sum, ua) => sum + (ua.attendanceType?.workTime || 0),
                0,
            );

            let dailyWorkTime = 0;

            // 뷰 로직과 동기화: 실제 출입기록이 있는 경우
            if (
                dailySummary?.realEnter !== null &&
                dailySummary?.realEnter !== undefined &&
                dailySummary?.realLeave !== null &&
                dailySummary?.realLeave !== undefined
            ) {
                // workTime + 근태시간
                const baseWorkTime = (dailySummary.workTime || 0) + totalAttendanceWorkTime;

                // 점심시간 차감 (12:00-13:00 포함 시)
                let lunchDeduction = 0;
                if (dailySummary.realEnter <= '12:00:00' && dailySummary.realLeave >= '13:00:00') {
                    lunchDeduction = 60;
                }

                // 저녁시간 차감 (13시간 이상 근무 시)
                let dinnerDeduction = 0;
                if (baseWorkTime >= 780) {
                    dinnerDeduction = 30;
                }

                dailyWorkTime = baseWorkTime - lunchDeduction - dinnerDeduction;
            }
            // 출입기록이 없지만 근태 이력이 있는 경우 (연차, 반차 등)
            else if (
                (dailySummary?.realEnter === null || dailySummary?.realLeave === null) &&
                totalAttendanceWorkTime > 0
            ) {
                dailyWorkTime = totalAttendanceWorkTime;
            }

            group.workTime += dailyWorkTime;
        });

        // 주차별 요약 생성
        const weeklyWorkTimeSummary: Array<{
            weekNumber: number;
            startDate: string;
            endDate: string;
            weeklyWorkTime: number;
        }> = [];

        weekGroups.forEach((group, weekNumber) => {
            const sortedDates = group.dates.sort();
            weeklyWorkTimeSummary.push({
                weekNumber,
                startDate: sortedDates[0],
                endDate: sortedDates[sortedDates.length - 1],
                weeklyWorkTime: group.workTime,
            });
        });

        return weeklyWorkTimeSummary.sort((a, b) => a.weekNumber - b.weekNumber);
    }

    /**
     * 지각 시간 계산 (분)
     */
    private calculateLateMinutes(enter: string | null): number {
        if (!enter) return 0;

        const scheduledEnter = new Date(`2000-01-01 09:00:00`);
        const actualEnter = new Date(`2000-01-01 ${enter}`);

        const diff = actualEnter.getTime() - scheduledEnter.getTime();
        return Math.max(0, Math.floor(diff / (1000 * 60)));
    }

    /**
     * 조퇴 시간 계산 (분)
     */
    private calculateEarlyLeaveMinutes(leave: string | null): number {
        if (!leave) return 0;

        const scheduledLeave = new Date(`2000-01-01 18:00:00`);
        const actualLeave = new Date(`2000-01-01 ${leave}`);

        const diff = scheduledLeave.getTime() - actualLeave.getTime();
        return Math.max(0, Math.floor(diff / (1000 * 60)));
    }

    /**
     * 월간 요약 조회 (일일 요약 포함)
     */
    async findOneWithDailySummaries(employeeId: string, yyyymm: string): Promise<MonthlyEventSummary | null> {
        const summary = await this.repository.findOneByEmployeeIdAndYearMonth(employeeId, yyyymm);

        if (!summary) return null;

        // 일일 요약 조회
        const [year, month] = yyyymm.split('-');
        const startDate = format(startOfMonth(new Date(`${year}-${month}-01`)), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(new Date(`${year}-${month}-01`)), 'yyyy-MM-dd');

        const dailySummaries = await this.dataSource.manager
            .createQueryBuilder(DailyEventSummary, 'daily')
            .leftJoinAndSelect('daily.employee', 'employee')
            .where('daily.employeeId = :employeeId', { employeeId })
            .andWhere('daily.date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .orderBy('daily.date', 'ASC')
            .getMany();

        // 각 일일 요약에 근태 사용 내역 추가
        for (const daily of dailySummaries) {
            const usedAttendances = await this.dataSource.manager
                .createQueryBuilder(UsedAttendance, 'ua')
                .leftJoinAndSelect('ua.attendanceType', 'at')
                .where('ua."employeeId" = :employeeId', { employeeId: daily.employeeId })
                .andWhere('ua."usedAt" = :date::text', { date: daily.date })
                .getMany();

            (daily as any).usedAttendances = usedAttendances.map((ua) => ({
                usedAttendanceId: ua.usedAttendanceId,
                attendanceTypeId: ua.attendanceType?.attendanceTypeId || '',
                title: ua.attendanceType?.title,
            }));
        }

        summary.dailyEventSummary = dailySummaries;

        return summary;
    }

    /**
     * 특정 연월의 모든 월간 요약 조회
     */
    async findByYearMonth(yyyymm: string): Promise<MonthlyEventSummary[]> {
        return this.repository.findByYearMonth(yyyymm);
    }

    /**
     * 특정 직원의 모든 월간 요약 조회
     */
    async findByEmployeeId(employeeId: string): Promise<MonthlyEventSummary[]> {
        return this.repository.findByEmployeeId(employeeId);
    }

    /**
     * 연월 범위로 조회
     */
    async findByYearMonthRange(startYyyymm: string, endYyyymm: string): Promise<MonthlyEventSummary[]> {
        return this.repository.findByYearMonthRange(startYyyymm, endYyyymm);
    }
}
