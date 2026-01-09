import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { Employee } from '@libs/modules/employee/employee.entity';
import { DailyEventSummary } from '../daily-event-summary/daily-event-summary.entity';
import { AttendanceIssueDTO, AttendanceIssueStatus } from './attendance-issue.types';

/**
 * 근태 이슈 엔티티
 *
 * 일간요약이 생성되면서 정상근무범주 밖에 있는 경우 자동으로 생성되는 이슈
 * 이슈 발행 → 확인 → 근태정보 수정 → 요약데이터 반영 → 이력 생성
 */
@Entity('attendance_issue')
@Index(['employee_id', 'date'])
@Index(['status', 'created_at'])
export class AttendanceIssue extends BaseEntity<AttendanceIssueDTO> {
    // BaseEntity에서 id, created_at, updated_at, deleted_at, created_by, updated_by, version 제공

    /**
     * 직원 ID (외래키)
     */
    @Column({ name: 'employee_id', type: 'uuid' })
    employee_id: string;

    /**
     * 직원 엔티티와의 관계
     */
    @ManyToOne(() => Employee, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'employee_id' })
    employee: Employee;

    /**
     * 일간 요약 ID (외래키)
     * 이슈가 발생한 일간 요약
     */
    @Column({ name: 'daily_event_summary_id', type: 'uuid', nullable: true })
    daily_event_summary_id: string | null;

    /**
     * 일간 요약 엔티티와의 관계
     */
    @ManyToOne(() => DailyEventSummary, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'daily_event_summary_id' })
    dailyEventSummary: DailyEventSummary | null;

    /**
     * 날짜
     * 이슈가 발생한 날짜
     */
    @Column({
        name: 'date',
        type: 'date',
        comment: '날짜',
    })
    date: string;

    /**
     * 문제가 된 출근 시간
     * 원본 출근 시간
     */
    @Column({
        name: 'problematic_enter_time',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '문제가 된 출근 시간',
    })
    problematic_enter_time: string | null;

    /**
     * 문제가 된 퇴근 시간
     * 원본 퇴근 시간
     */
    @Column({
        name: 'problematic_leave_time',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '문제가 된 퇴근 시간',
    })
    problematic_leave_time: string | null;

    /**
     * 변경할 출근 시간
     * 수정이 필요한 출근 시간
     */
    @Column({
        name: 'corrected_enter_time',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '변경할 출근 시간',
    })
    corrected_enter_time: string | null;

    /**
     * 변경할 퇴근 시간
     * 수정이 필요한 퇴근 시간
     */
    @Column({
        name: 'corrected_leave_time',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '변경할 퇴근 시간',
    })
    corrected_leave_time: string | null;

    /**
     * 문제가 된 근태 유형 ID
     * 원본 근태 유형
     */
    @Column({
        name: 'problematic_attendance_type_id',
        type: 'uuid',
        nullable: true,
        comment: '문제가 된 근태 유형 ID',
    })
    problematic_attendance_type_id: string | null;

    /**
     * 변경할 근태 유형 ID
     * 수정이 필요한 근태 유형
     */
    @Column({
        name: 'corrected_attendance_type_id',
        type: 'uuid',
        nullable: true,
        comment: '변경할 근태 유형 ID',
    })
    corrected_attendance_type_id: string | null;

    /**
     * 상태
     * 이슈의 현재 상태
     */
    @Column({
        name: 'status',
        type: 'enum',
        enum: AttendanceIssueStatus,
        default: AttendanceIssueStatus.PENDING,
        comment: '상태',
    })
    status: AttendanceIssueStatus;

    /**
     * 이슈 설명
     * 문제가 발생한 이유나 상세 설명
     */
    @Column({
        name: 'description',
        type: 'text',
        nullable: true,
        comment: '이슈 설명',
    })
    description: string | null;

    /**
     * 확인자
     * 이슈를 확인한 사용자 ID 또는 이름
     */
    @Column({
        name: 'confirmed_by',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '확인자',
    })
    confirmed_by: string | null;

    /**
     * 확인 시간
     */
    @Column({
        name: 'confirmed_at',
        type: 'timestamp',
        nullable: true,
        comment: '확인 시간',
    })
    confirmed_at: Date | null;

    /**
     * 해결 시간
     */
    @Column({
        name: 'resolved_at',
        type: 'timestamp',
        nullable: true,
        comment: '해결 시간',
    })
    resolved_at: Date | null;

    /**
     * 거부 사유
     */
    @Column({
        name: 'rejection_reason',
        type: 'text',
        nullable: true,
        comment: '거부 사유',
    })
    rejection_reason: string | null;

    /**
     * 근태 이슈 불변성 검증
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
        if (!this.employee_id || !this.date) {
            return;
        }

        this.validateUuidFormat(this.employee_id, 'employee_id');
    }

    /**
     * 데이터 형식 검증
     */
    private validateDataFormat(): void {
        // 시간 필드 길이 검증
        if (this.problematic_enter_time && this.problematic_enter_time.length > 50) {
            throw new Error('문제가 된 출근 시간은 50자 이하여야 합니다.');
        }
        if (this.problematic_leave_time && this.problematic_leave_time.length > 50) {
            throw new Error('문제가 된 퇴근 시간은 50자 이하여야 합니다.');
        }
        if (this.corrected_enter_time && this.corrected_enter_time.length > 50) {
            throw new Error('변경할 출근 시간은 50자 이하여야 합니다.');
        }
        if (this.corrected_leave_time && this.corrected_leave_time.length > 50) {
            throw new Error('변경할 퇴근 시간은 50자 이하여야 합니다.');
        }

        // UUID 형식 검증
        if (this.daily_event_summary_id) {
            this.validateUuidFormat(this.daily_event_summary_id, 'daily_event_summary_id');
        }
        if (this.problematic_attendance_type_id) {
            this.validateUuidFormat(this.problematic_attendance_type_id, 'problematic_attendance_type_id');
        }
        if (this.corrected_attendance_type_id) {
            this.validateUuidFormat(this.corrected_attendance_type_id, 'corrected_attendance_type_id');
        }
    }

    /**
     * 논리적 일관성 검증
     */
    private validateLogicalConsistency(): void {
        // 추가적인 논리적 검증이 필요한 경우 여기에 구현
    }

    /**
     * 근태 이슈를 생성한다
     */
    constructor(
        employee_id: string,
        date: string,
        daily_event_summary_id?: string,
        problematic_enter_time?: string,
        problematic_leave_time?: string,
        corrected_enter_time?: string,
        corrected_leave_time?: string,
        problematic_attendance_type_id?: string,
        corrected_attendance_type_id?: string,
        description?: string,
    ) {
        super();
        this.employee_id = employee_id;
        this.date = date;
        this.daily_event_summary_id = daily_event_summary_id || null;
        this.problematic_enter_time = problematic_enter_time || null;
        this.problematic_leave_time = problematic_leave_time || null;
        this.corrected_enter_time = corrected_enter_time || null;
        this.corrected_leave_time = corrected_leave_time || null;
        this.problematic_attendance_type_id = problematic_attendance_type_id || null;
        this.corrected_attendance_type_id = corrected_attendance_type_id || null;
        this.description = description || null;
        this.status = AttendanceIssueStatus.PENDING;
        this.confirmed_by = null;
        this.confirmed_at = null;
        this.resolved_at = null;
        this.rejection_reason = null;
        this.validateInvariants();
    }

    /**
     * 근태 이슈 정보를 업데이트한다
     */
    업데이트한다(
        problematic_enter_time?: string,
        problematic_leave_time?: string,
        corrected_enter_time?: string,
        corrected_leave_time?: string,
        problematic_attendance_type_id?: string,
        corrected_attendance_type_id?: string,
        description?: string,
        status?: AttendanceIssueStatus,
        rejection_reason?: string,
    ): void {
        if (problematic_enter_time !== undefined) {
            this.problematic_enter_time = problematic_enter_time;
        }
        if (problematic_leave_time !== undefined) {
            this.problematic_leave_time = problematic_leave_time;
        }
        if (corrected_enter_time !== undefined) {
            this.corrected_enter_time = corrected_enter_time;
        }
        if (corrected_leave_time !== undefined) {
            this.corrected_leave_time = corrected_leave_time;
        }
        if (problematic_attendance_type_id !== undefined) {
            this.problematic_attendance_type_id = problematic_attendance_type_id;
        }
        if (corrected_attendance_type_id !== undefined) {
            this.corrected_attendance_type_id = corrected_attendance_type_id;
        }
        if (description !== undefined) {
            this.description = description;
        }
        if (status !== undefined) {
            this.status = status;
        }
        if (rejection_reason !== undefined) {
            this.rejection_reason = rejection_reason;
        }
        this.validateInvariants();
    }

    /**
     * 확인 처리
     */
    확인처리한다(confirmed_by: string): void {
        this.status = AttendanceIssueStatus.CONFIRMED;
        this.confirmed_by = confirmed_by;
        this.confirmed_at = new Date();
    }

    /**
     * 해결 처리
     */
    해결처리한다(): void {
        this.status = AttendanceIssueStatus.RESOLVED;
        this.resolved_at = new Date();
    }

    /**
     * 거부 처리
     */
    거부처리한다(rejection_reason: string): void {
        this.status = AttendanceIssueStatus.REJECTED;
        this.rejection_reason = rejection_reason;
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): AttendanceIssueDTO {
        return {
            id: this.id,
            employeeId: this.employee_id,
            dailyEventSummaryId: this.daily_event_summary_id,
            date: this.date,
            problematicEnterTime: this.problematic_enter_time,
            problematicLeaveTime: this.problematic_leave_time,
            correctedEnterTime: this.corrected_enter_time,
            correctedLeaveTime: this.corrected_leave_time,
            problematicAttendanceTypeId: this.problematic_attendance_type_id,
            correctedAttendanceTypeId: this.corrected_attendance_type_id,
            status: this.status,
            description: this.description,
            confirmedBy: this.confirmed_by,
            confirmedAt: this.confirmed_at,
            resolvedAt: this.resolved_at,
            rejectionReason: this.rejection_reason,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
}
