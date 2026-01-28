import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { BaseEntity } from '@libs/database/base/base.entity';
import { Employee } from '@libs/modules/employee/employee.entity';
import { AttendanceType } from '../attendance-type/attendance-type.entity';
import { UsedAttendanceDTO } from './used-attendance.types';

/**
 * 사용된 근태 엔티티
 */
@Entity('used_attendance')
@Index(['employee_id', 'used_at', 'attendance_type_id'], { unique: true })
export class UsedAttendance extends BaseEntity<UsedAttendanceDTO> {
    // BaseEntity에서 id, created_at, updated_at, deleted_at, created_by, updated_by, version 제공

    @Column({
        name: 'used_at',
        comment: '사용 날짜',
    })
    used_at: string;

    @Column({
        name: 'employee_id',
        type: 'uuid',
        comment: '직원 ID',
    })
    employee_id: string;

    @Column({
        name: 'attendance_type_id',
        type: 'uuid',
        comment: '근태 유형 ID',
    })
    attendance_type_id: string;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: 'employee_id' })
    employee: Employee;

    @ManyToOne(() => AttendanceType)
    @JoinColumn({ name: 'attendance_type_id' })
    attendanceType: AttendanceType;

    /**
     * 사용된 근태 불변성 검증
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
        if (!this.used_at || !this.employee_id || !this.attendance_type_id) {
            return;
        }

        if (this.used_at.trim().length === 0) {
            throw new BadRequestException('사용 날짜는 필수입니다.');
        }

        this.validateUuidFormat(this.employee_id, 'employee_id');
        this.validateUuidFormat(this.attendance_type_id, 'attendance_type_id');
    }

    /**
     * 데이터 형식 검증
     */
    private validateDataFormat(): void {
        // 추가적인 형식 검증이 필요한 경우 여기에 구현
    }

    /**
     * 논리적 일관성 검증
     */
    private validateLogicalConsistency(): void {
        // 추가적인 논리적 검증이 필요한 경우 여기에 구현
    }

    /**
     * 사용된 근태를 생성한다
     */
    constructor(used_at: string, employee_id: string, attendance_type_id: string) {
        super();
        this.used_at = used_at;
        this.employee_id = employee_id;
        this.attendance_type_id = attendance_type_id;
        this.validateInvariants();
    }

    /**
     * 사용된 근태 정보를 업데이트한다
     */
    업데이트한다(used_at?: string, attendance_type_id?: string): void {
        if (used_at !== undefined) {
            this.used_at = used_at;
        }
        if (attendance_type_id !== undefined) {
            this.attendance_type_id = attendance_type_id;
        }
        this.validateInvariants();
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): UsedAttendanceDTO {
        return {
            id: this.id,
            usedAt: this.used_at,
            employeeId: this.employee_id,
            attendanceTypeId: this.attendance_type_id,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
            attendanceType: this.attendanceType?.DTO변환한다() || null,
        };
    }
}
