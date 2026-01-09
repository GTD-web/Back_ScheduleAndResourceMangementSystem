import { Entity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { AttendanceTypeDTO } from './attendance-type.types';

/**
 * 출석 타입 엔티티
 */
@Entity('attendance_types')
export class AttendanceType extends BaseEntity<AttendanceTypeDTO> {
    // BaseEntity에서 id, created_at, updated_at, deleted_at, created_by, updated_by, version 제공

    @Column({
        name: 'title',
        comment: '출석 타입 제목',
    })
    title: string;

    @Column({
        name: 'work_time',
        comment: '근무 시간 (분 단위)',
    })
    work_time: number;

    @Column({
        name: 'is_recognized_work_time',
        comment: '인정 근무 시간 여부',
    })
    is_recognized_work_time: boolean;

    @Column({
        name: 'start_work_time',
        nullable: true,
        comment: '시작 근무 시간',
    })
    start_work_time: string | null;

    @Column({
        name: 'end_work_time',
        nullable: true,
        comment: '종료 근무 시간',
    })
    end_work_time: string | null;

    @Column({
        name: 'deducted_annual_leave',
        type: 'float',
        default: 0,
        comment: '차감 연차',
    })
    deducted_annual_leave: number;

    /**
     * 출석 타입 불변성 검증
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
        if (!this.title) {
            return;
        }

        if (this.title.trim().length === 0) {
            throw new Error('출석 타입 제목은 필수입니다.');
        }
    }

    /**
     * 데이터 형식 검증
     */
    private validateDataFormat(): void {
        // TypeORM 메타데이터 검증 단계에서는 검증을 건너뜀
        if (this.work_time === undefined || this.deducted_annual_leave === undefined) {
            return;
        }

        // work_time은 0 이상이어야 함
        if (this.work_time < 0) {
            throw new Error('근무 시간은 0 이상이어야 합니다.');
        }

        // deducted_annual_leave는 0 이상이어야 함
        if (this.deducted_annual_leave < 0) {
            throw new Error('차감 연차는 0 이상이어야 합니다.');
        }
    }

    /**
     * 논리적 일관성 검증
     */
    private validateLogicalConsistency(): void {
        // 추가적인 논리적 검증이 필요한 경우 여기에 구현
    }

    /**
     * 출석 타입을 생성한다
     */
    constructor(
        title: string,
        work_time: number,
        is_recognized_work_time: boolean,
        start_work_time?: string,
        end_work_time?: string,
        deducted_annual_leave: number = 0,
    ) {
        super();
        this.title = title;
        this.work_time = work_time;
        this.is_recognized_work_time = is_recognized_work_time;
        this.start_work_time = start_work_time || null;
        this.end_work_time = end_work_time || null;
        this.deducted_annual_leave = deducted_annual_leave;
        this.validateInvariants();
    }

    /**
     * 출석 타입 정보를 업데이트한다
     */
    업데이트한다(
        title?: string,
        work_time?: number,
        is_recognized_work_time?: boolean,
        start_work_time?: string,
        end_work_time?: string,
        deducted_annual_leave?: number,
    ): void {
        if (title !== undefined) {
            this.title = title;
        }
        if (work_time !== undefined) {
            this.work_time = work_time;
        }
        if (is_recognized_work_time !== undefined) {
            this.is_recognized_work_time = is_recognized_work_time;
        }
        if (start_work_time !== undefined) {
            this.start_work_time = start_work_time;
        }
        if (end_work_time !== undefined) {
            this.end_work_time = end_work_time;
        }
        if (deducted_annual_leave !== undefined) {
            this.deducted_annual_leave = deducted_annual_leave;
        }
        this.validateInvariants();
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): AttendanceTypeDTO {
        return {
            id: this.id,
            title: this.title,
            workTime: this.work_time,
            isRecognizedWorkTime: this.is_recognized_work_time,
            startWorkTime: this.start_work_time,
            endWorkTime: this.end_work_time,
            deductedAnnualLeave: this.deducted_annual_leave,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }

    /**
     * 근무 시간 계산 (BeforeInsert, BeforeUpdate)
     * work_time이 60 미만이면 분 단위로 간주하고 시간 단위로 변환
     */
    @BeforeInsert()
    @BeforeUpdate()
    calculateWorkTime(): void {
        if (this.work_time < 60) {
            this.work_time = this.work_time * 60;
        }
    }
}
