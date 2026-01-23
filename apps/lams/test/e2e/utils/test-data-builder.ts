import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Employee } from '@libs/modules/employee/employee.entity';
import { Department } from '@libs/modules/department/department.entity';
import { AttendanceType } from '../../../src/refactoring/domain/attendance-type/attendance-type.entity';
import { DailyEventSummary } from '../../../src/refactoring/domain/daily-event-summary/daily-event-summary.entity';
import { DataSnapshotInfo } from '../../../src/refactoring/domain/data-snapshot-info/data-snapshot-info.entity';
import { AttendanceIssue } from '../../../src/refactoring/domain/attendance-issue/attendance-issue.entity';
import { File } from '../../../src/refactoring/domain/file/file.entity';
import { FileContentReflectionHistory } from '../../../src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.entity';
import { HolidayInfo } from '../../../src/refactoring/domain/holiday-info/holiday-info.entity';
import { WorkTimeOverride } from '../../../src/refactoring/domain/work-time-override/work-time-override.entity';
import { IsNull } from 'typeorm';
import { DomainAttendanceTypeService } from '../../../src/refactoring/domain/attendance-type/attendance-type.service';

/**
 * E2E 테스트용 데이터 빌더
 *
 * 실제 데이터베이스에서 데이터를 조회하거나 생성하여 테스트에 사용합니다.
 */
export class TestDataBuilder {
    private dataSource: DataSource;
    private attendanceTypeService: DomainAttendanceTypeService;

    constructor(app: INestApplication) {
        this.dataSource = app.get(DataSource);
        this.attendanceTypeService = app.get(DomainAttendanceTypeService);
    }

    /**
     * 직원을 조회한다 (없으면 첫 번째 직원 반환)
     */
    async getEmployee(): Promise<Employee | null> {
        const employee = await this.dataSource.manager.findOne(Employee, {
            where: {},
        });
        return employee;
    }

    /**
     * 부서를 조회한다 (없으면 첫 번째 부서 반환)
     */
    async getDepartment(): Promise<Department | null> {
        const department = await this.dataSource.manager.findOne(Department, {
            where: {},
        });
        return department;
    }

    /**
     * 근태 유형을 조회한다 (제목으로)
     */
    async getAttendanceTypeByTitle(title: string): Promise<AttendanceType | null> {
        const attendanceType = await this.dataSource.manager.findOne(AttendanceType, {
            where: { title, deleted_at: IsNull() },
        });
        return attendanceType;
    }

    /**
     * '연차' 근태 유형을 조회한다
     */
    async getAnnualLeaveType(): Promise<AttendanceType | null> {
        return this.getAttendanceTypeByTitle('연차');
    }

    /**
     * '오전반차' 근태 유형을 조회한다
     */
    async getMorningHalfDayType(): Promise<AttendanceType | null> {
        return this.getAttendanceTypeByTitle('오전반차');
    }

    /**
     * 일간 요약을 조회한다 (없으면 null 반환)
     */
    async getDailySummary(): Promise<DailyEventSummary | null> {
        const summary = await this.dataSource.manager.findOne(DailyEventSummary, {
            where: { deleted_at: IsNull() },
        });
        return summary;
    }

    /**
     * 스냅샷을 조회한다 (없으면 null 반환)
     */
    async getSnapshot(): Promise<DataSnapshotInfo | null> {
        const snapshot = await this.dataSource.manager.findOne(DataSnapshotInfo, {
            where: { deleted_at: IsNull() },
        });
        return snapshot;
    }

    /**
     * 근태 이슈를 조회한다 (없으면 null 반환)
     */
    async getAttendanceIssue(): Promise<AttendanceIssue | null> {
        const issue = await this.dataSource.manager.findOne(AttendanceIssue, {
            where: { deleted_at: IsNull() },
        });
        return issue;
    }

    /**
     * 파일을 조회한다 (없으면 null 반환)
     */
    async getFile(): Promise<File | null> {
        const file = await this.dataSource.manager.findOne(File, {
            where: { deleted_at: IsNull() },
        });
        return file;
    }

    /**
     * 파일 반영 이력을 조회한다 (없으면 null 반환)
     */
    async getFileContentReflectionHistory(): Promise<FileContentReflectionHistory | null> {
        const history = await this.dataSource.manager.findOne(FileContentReflectionHistory, {
            where: { deleted_at: IsNull() },
        });
        return history;
    }

    /**
     * 휴일 정보를 조회한다 (없으면 null 반환)
     */
    async getHoliday(): Promise<HolidayInfo | null> {
        const holiday = await this.dataSource.manager.findOne(HolidayInfo, {
            where: { deleted_at: IsNull() },
        });
        return holiday;
    }

    /**
     * 특별근태시간을 조회한다 (없으면 null 반환)
     */
    async getWorkTimeOverride(): Promise<WorkTimeOverride | null> {
        const override = await this.dataSource.manager.findOne(WorkTimeOverride, {
            where: { deleted_at: IsNull() },
        });
        return override;
    }

    /**
     * 테스트용 일간 요약을 생성한다
     */
    async createTestDailySummary(
        date: string,
        employeeId: string,
        monthlyEventSummaryId?: string,
    ): Promise<DailyEventSummary> {
        const summary = new DailyEventSummary(
            date,
            employeeId,
            monthlyEventSummaryId,
            false, // is_holiday
            '09:00:00', // enter
            '18:00:00', // leave
            '09:00:00', // real_enter
            '18:00:00', // real_leave
            true, // is_checked
            false, // is_late
            false, // is_early_leave
            false, // is_absent
            false, // has_attendance_conflict
            false, // has_attendance_overlap
            480, // work_time
            '', // note
            null, // used_attendances
        );
        summary.생성자설정한다('test-user');
        summary.메타데이터업데이트한다('test-user');
        return await this.dataSource.manager.save(summary);
    }

    /**
     * 근태 유형이 존재하는지 확인하고 없으면 생성한다
     */
    async ensureAttendanceType(title: string): Promise<AttendanceType> {
        let attendanceType = await this.getAttendanceTypeByTitle(title);
        if (!attendanceType) {
            // 기본값으로 생성
            const defaultData = this.getDefaultAttendanceTypeData(title);
            if (defaultData) {
                const dto = await this.attendanceTypeService.생성한다(defaultData);
                attendanceType = await this.dataSource.manager.findOne(AttendanceType, {
                    where: { id: dto.id },
                });
            }
        }
        if (!attendanceType) {
            throw new Error(`근태 유형 "${title}"을 생성할 수 없습니다.`);
        }
        return attendanceType;
    }

    /**
     * 기본 근태 유형 데이터를 반환한다
     */
    private getDefaultAttendanceTypeData(title: string): {
        title: string;
        workTime: number;
        isRecognizedWorkTime: boolean;
        startWorkTime?: string;
        endWorkTime?: string;
        deductedAnnualLeave: number;
    } | null {
        const defaults: Record<
            string,
            {
                title: string;
                workTime: number;
                isRecognizedWorkTime: boolean;
                startWorkTime: string;
                endWorkTime: string;
                deductedAnnualLeave: number;
            }
        > = {
            연차: {
                title: '연차',
                workTime: 480,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 1.0,
            },
            오전반차: {
                title: '오전반차',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '14:00',
                deductedAnnualLeave: 0.5,
            },
            오후반차: {
                title: '오후반차',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '14:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.5,
            },
            출장: {
                title: '출장',
                workTime: 480,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
        };
        return defaults[title] || null;
    }

    /**
     * 테스트 데이터를 정리한다
     */
    async cleanup(): Promise<void> {
        // 테스트에서 생성한 데이터를 정리할 수 있음
        // 필요시 구현
    }
}
