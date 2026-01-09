import { Entity, Column, Index, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { Employee } from '@libs/modules/employee/employee.entity';
import { DailyEventSummaryDTO } from './daily-event-summary.types';

/**
 * 월간 요약 엔티티 타입 (순환 참조 방지)
 */
type MonthlyEventSummaryType = any;

@Entity('daily_event_summaries')
@Index(['date', 'employee_id'], { unique: true })
export class DailyEventSummary extends BaseEntity<DailyEventSummaryDTO> {
    // BaseEntity에서 id, created_at, updated_at, deleted_at, created_by, updated_by, version 제공

    @Column({ name: 'date', type: 'date' })
    date: string;

    @Column({ name: 'employee_id', type: 'uuid', nullable: true })
    employee_id: string | null;

    @ManyToOne(() => Employee, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'employee_id' })
    employee: Employee | null;

    /**
     * 월간 요약 ID (외래키)
     */
    @Column({ name: 'monthly_event_summary_id', type: 'uuid', nullable: true })
    monthly_event_summary_id: string | null;

    /**
     * 월간 요약 엔티티와의 관계
     * 순환 참조를 피하기 위해 엔티티 이름(문자열)으로 참조
     */
    @ManyToOne('MonthlyEventSummary', 'dailyEventSummaries', {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'monthly_event_summary_id' })
    monthlyEventSummary: MonthlyEventSummaryType | null;

    @Column({ name: 'is_holiday', type: 'boolean', default: false })
    is_holiday: boolean;

    // 보여주기용 출근 시간
    @Column({ name: 'enter', nullable: true })
    enter: string | null;

    // 보여주기용 퇴근 시간
    @Column({ name: 'leave', nullable: true })
    leave: string | null;

    // 실제 출근 시간
    @Column({ name: 'real_enter', nullable: true })
    real_enter: string | null;

    // 실제 퇴근 시간
    @Column({ name: 'real_leave', nullable: true })
    real_leave: string | null;

    // 검토 완료 여부
    @Column({ name: 'is_checked', default: true })
    is_checked: boolean;

    // 지각 여부
    @Column({ name: 'is_late', default: false })
    is_late: boolean;

    // 조퇴 여부
    @Column({ name: 'is_early_leave', default: false })
    is_early_leave: boolean;

    // 결근 여부
    @Column({ name: 'is_absent', default: false })
    is_absent: boolean;

    // 근무 시간
    @Column({ name: 'work_time', type: 'int', nullable: true })
    work_time: number | null;

    @Column({ name: 'note', nullable: true })
    note: string | null;

    /**
     * 사용된 근태 유형 정보 (JSONB)
     * 해당 날짜에 사용된 근태 유형들의 정보를 저장
     */
    @Column({ name: 'used_attendances', type: 'jsonb', nullable: true })
    used_attendances: Array<{
        attendanceTypeId: string;
        title: string;
        workTime?: number;
        isRecognizedWorkTime?: boolean;
        startWorkTime?: string | null;
        endWorkTime?: string | null;
        deductedAnnualLeave?: number;
    }> | null;

    /**
     * 일간 요약 불변성 검증
     */
    private validateInvariants(): void {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }

    /**
     * 필수 데이터 검증
     */
    private validateRequiredData(): void {
        // TypeORM 메타데이터 검증 단계에서는 검증을 건너뜀
        if (!this.date) {
            return;
        }
    }

    /**
     * 데이터 형식 검증
     */
    private validateDataFormat(): void {
        // UUID 형식 검증
        if (this.employee_id) {
            this.validateUuidFormat(this.employee_id, 'employee_id');
        }
        if (this.monthly_event_summary_id) {
            this.validateUuidFormat(this.monthly_event_summary_id, 'monthly_event_summary_id');
        }
    }

    /**
     * 논리적 일관성 검증
     */
    private validateLogicalConsistency(): void {
        // 추가적인 논리적 검증이 필요한 경우 여기에 구현
    }

    /**
     * 일간 요약을 생성한다
     */
    constructor(
        date: string,
        employee_id?: string,
        monthly_event_summary_id?: string,
        is_holiday: boolean = false,
        enter?: string,
        leave?: string,
        real_enter?: string,
        real_leave?: string,
        is_checked: boolean = true,
        is_late: boolean = false,
        is_early_leave: boolean = false,
        is_absent: boolean = false,
        work_time?: number,
        note?: string,
        used_attendances?: Array<{
            attendanceTypeId: string;
            title: string;
            workTime?: number;
            isRecognizedWorkTime?: boolean;
            startWorkTime?: string | null;
            endWorkTime?: string | null;
            deductedAnnualLeave?: number;
        }>,
    ) {
        super();
        this.date = date;
        this.employee_id = employee_id || null;
        this.monthly_event_summary_id = monthly_event_summary_id || null;
        this.is_holiday = is_holiday;
        this.enter = enter || null;
        this.leave = leave || null;
        this.real_enter = real_enter || null;
        this.real_leave = real_leave || null;
        this.is_checked = is_checked;
        this.is_late = is_late;
        this.is_early_leave = is_early_leave;
        this.is_absent = is_absent;
        this.work_time = work_time || null;
        this.note = note || null;
        this.used_attendances = used_attendances || null;
        this.validateInvariants();
    }

    /**
     * 일간 요약 정보를 업데이트한다
     */
    업데이트한다(
        monthly_event_summary_id?: string,
        is_holiday?: boolean,
        enter?: string,
        leave?: string,
        real_enter?: string,
        real_leave?: string,
        is_checked?: boolean,
        is_late?: boolean,
        is_early_leave?: boolean,
        is_absent?: boolean,
        work_time?: number,
        note?: string,
        used_attendances?: Array<{
            attendanceTypeId: string;
            title: string;
            workTime?: number;
            isRecognizedWorkTime?: boolean;
            startWorkTime?: string | null;
            endWorkTime?: string | null;
            deductedAnnualLeave?: number;
        }>,
    ): void {
        if (monthly_event_summary_id !== undefined) {
            this.monthly_event_summary_id = monthly_event_summary_id;
        }
        if (is_holiday !== undefined) {
            this.is_holiday = is_holiday;
        }
        if (enter !== undefined) {
            this.enter = enter;
        }
        if (leave !== undefined) {
            this.leave = leave;
        }
        if (real_enter !== undefined) {
            this.real_enter = real_enter;
        }
        if (real_leave !== undefined) {
            this.real_leave = real_leave;
        }
        if (is_checked !== undefined) {
            this.is_checked = is_checked;
        }
        if (is_late !== undefined) {
            this.is_late = is_late;
        }
        if (is_early_leave !== undefined) {
            this.is_early_leave = is_early_leave;
        }
        if (is_absent !== undefined) {
            this.is_absent = is_absent;
        }
        if (work_time !== undefined) {
            this.work_time = work_time;
        }
        if (note !== undefined) {
            this.note = note;
        }
        if (used_attendances !== undefined) {
            this.used_attendances = used_attendances;
        }
        this.validateInvariants();
    }

    /**
     * 근무 시간 계산 (BeforeInsert, BeforeUpdate)
     */
    @BeforeInsert()
    @BeforeUpdate()
    근무시간계산한다(): void {
        if (this.enter && this.leave && this.date) {
            const enterDate = new Date(`${this.date}T${this.enter}`);
            const leaveDate = new Date(`${this.date}T${this.leave}`);
            const diff = leaveDate.getTime() - enterDate.getTime();
            // Convert milliseconds to minutes
            this.work_time = Math.floor(diff / (1000 * 60));
        } else {
            this.work_time = null;
        }
    }

    /**
     * 이벤트 시간 입력
     */
    이벤트시간입력한다(earliest: string, latest: string): void {
        this.enter = earliest;
        this.leave = latest;
        this.real_enter = earliest;
        this.real_leave = latest;
        this.is_absent = false;
        this.is_late = false;
        this.is_early_leave = false;
        this.is_checked = true;
        this.note = '';
    }

    /**
     * 이벤트 시간 초기화
     */
    이벤트시간초기화한다(): void {
        this.enter = '';
        this.leave = '';
        this.real_enter = '';
        this.real_leave = '';
        this.is_absent = false;
        this.is_late = false;
        this.is_early_leave = false;
        this.is_checked = true;
        this.note = '';
    }

    /**
     * 비고 업데이트
     */
    비고업데이트한다(note: string): void {
        this.note = note;
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): DailyEventSummaryDTO {
        return {
            id: this.id,
            date: this.date,
            employeeId: this.employee_id,
            monthlyEventSummaryId: this.monthly_event_summary_id,
            isHoliday: this.is_holiday,
            enter: this.enter,
            leave: this.leave,
            realEnter: this.real_enter,
            realLeave: this.real_leave,
            isChecked: this.is_checked,
            isLate: this.is_late,
            isEarlyLeave: this.is_early_leave,
            isAbsent: this.is_absent,
            workTime: this.work_time,
            note: this.note,
            usedAttendances: this.used_attendances,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
}
