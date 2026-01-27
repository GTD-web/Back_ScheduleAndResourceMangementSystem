import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { WorkScheduleTypeDTO, ScheduleType } from './work-schedule-type.types';

/**
 * 근무 유형 엔티티
 *
 * 전사적으로 적용되는 고정근무/유연근무 상태를 기간별로 관리합니다.
 * 언제든 변경 가능하며, 변경 시 이전 상태의 종료시점과 새 상태의 시작점이 있습니다.
 */
@Entity('work_schedule_types')
@Index(['start_date'])
@Index(['end_date'])
export class WorkScheduleType extends BaseEntity<WorkScheduleTypeDTO> {
    // BaseEntity에서 id, created_at, updated_at, deleted_at, created_by, updated_by, version 제공

    @Column({
        name: 'schedule_type',
        type: 'varchar',
        length: 20,
        comment: '근무 유형 (FIXED: 고정근무, FLEXIBLE: 유연근무)',
    })
    schedule_type: ScheduleType;

    @Column({
        name: 'start_date',
        type: 'date',
        comment: '시작일 (yyyy-MM-dd)',
    })
    start_date: string;

    @Column({
        name: 'end_date',
        type: 'date',
        nullable: true,
        comment: '종료일 (yyyy-MM-dd, null이면 현재 적용 중)',
    })
    end_date: string | null;

    @Column({
        name: 'reason',
        type: 'text',
        nullable: true,
        comment: '변경 사유',
    })
    reason: string | null;

    /**
     * 근무 유형 불변성 검증
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
        if (!this.schedule_type || !this.start_date) {
            return;
        }

        if (this.start_date.trim().length === 0) {
            throw new Error('시작일은 필수입니다.');
        }
    }

    /**
     * 데이터 형식 검증
     */
    private validateDataFormat(): void {
        // 날짜 형식 검증 (yyyy-MM-dd)
        if (this.start_date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(this.start_date)) {
                throw new Error('시작일은 yyyy-MM-dd 형식이어야 합니다.');
            }
        }

        if (this.end_date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(this.end_date)) {
                throw new Error('종료일은 yyyy-MM-dd 형식이어야 합니다.');
            }
        }

        // 근무 유형 검증
        if (this.schedule_type) {
            if (!Object.values(ScheduleType).includes(this.schedule_type)) {
                throw new Error(`근무 유형은 ${Object.values(ScheduleType).join(', ')} 중 하나여야 합니다.`);
            }
        }
    }

    /**
     * 논리적 일관성 검증
     */
    private validateLogicalConsistency(): void {
        // 시작일과 종료일이 모두 있으면 시작일이 종료일보다 이전이어야 함
        if (this.start_date && this.end_date) {
            const startDate = new Date(this.start_date);
            const endDate = new Date(this.end_date);

            if (startDate >= endDate) {
                throw new Error('시작일은 종료일보다 이전이어야 합니다.');
            }
        }
    }

    /**
     * 근무 유형을 생성한다
     */
    constructor(
        schedule_type: ScheduleType,
        start_date: string,
        end_date?: string | null,
        reason?: string,
    ) {
        super();
        this.schedule_type = schedule_type;
        this.start_date = start_date;
        this.end_date = end_date || null;
        this.reason = reason || null;
        this.validateInvariants();
    }

    /**
     * 근무 유형을 업데이트한다
     */
    업데이트한다(
        schedule_type?: ScheduleType,
        start_date?: string,
        end_date?: string | null,
        reason?: string,
    ): void {
        if (schedule_type !== undefined) {
            this.schedule_type = schedule_type;
        }
        if (start_date !== undefined) {
            this.start_date = start_date;
        }
        if (end_date !== undefined) {
            this.end_date = end_date;
        }
        if (reason !== undefined) {
            this.reason = reason;
        }
        this.validateInvariants();
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): WorkScheduleTypeDTO {
        return {
            id: this.id,
            scheduleType: this.schedule_type,
            startDate: this.start_date,
            endDate: this.end_date,
            reason: this.reason,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
}
