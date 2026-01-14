import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { WorkTimeOverrideDTO } from './work-time-override.types';

/**
 * 근무시간 커스터마이징 엔티티
 *
 * 특정 날짜의 정상 출퇴근 시간을 커스터마이징할 수 있습니다.
 * 예: 눈으로 인한 출근시간 조정, 명절 전날 조기 퇴근 등
 */
@Entity('work_time_overrides')
@Index(['date'], { unique: true })
export class WorkTimeOverride extends BaseEntity<WorkTimeOverrideDTO> {
    // BaseEntity에서 id, created_at, updated_at, deleted_at, created_by, updated_by, version 제공

    @Column({
        name: 'date',
        type: 'date',
        unique: true,
        comment: '적용 날짜 (yyyy-MM-dd)',
    })
    date: string;

    @Column({
        name: 'start_work_time',
        nullable: true,
        comment: '정상근무 시작 시간 (HH:MM:SS 형식, null이면 기본값 사용)',
    })
    start_work_time: string | null;

    @Column({
        name: 'end_work_time',
        nullable: true,
        comment: '정상근무 종료 시간 (HH:MM:SS 형식, null이면 기본값 사용)',
    })
    end_work_time: string | null;

    @Column({
        name: 'reason',
        nullable: true,
        comment: '변경 사유',
    })
    reason: string | null;

    /**
     * 근무시간 커스터마이징 불변성 검증
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

        if (this.date.trim().length === 0) {
            throw new Error('날짜는 필수입니다.');
        }
    }

    /**
     * 데이터 형식 검증
     */
    private validateDataFormat(): void {
        // 날짜 형식 검증 (yyyy-MM-dd)
        if (this.date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(this.date)) {
                throw new Error('날짜는 yyyy-MM-dd 형식이어야 합니다.');
            }
        }

        // 시간 형식 검증 (HH:MM:SS)
        if (this.start_work_time) {
            const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
            if (!timeRegex.test(this.start_work_time)) {
                throw new Error('시작 시간은 HH:MM:SS 형식이어야 합니다.');
            }
        }

        if (this.end_work_time) {
            const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
            if (!timeRegex.test(this.end_work_time)) {
                throw new Error('종료 시간은 HH:MM:SS 형식이어야 합니다.');
            }
        }
    }

    /**
     * 논리적 일관성 검증
     */
    private validateLogicalConsistency(): void {
        // 시작 시간과 종료 시간이 모두 있으면 시작 시간이 종료 시간보다 이전이어야 함
        if (this.start_work_time && this.end_work_time) {
            const startParts = this.start_work_time.split(':').map(Number);
            const endParts = this.end_work_time.split(':').map(Number);
            const startMinutes = startParts[0] * 60 + startParts[1];
            const endMinutes = endParts[0] * 60 + endParts[1];

            if (startMinutes >= endMinutes) {
                throw new Error('시작 시간은 종료 시간보다 이전이어야 합니다.');
            }
        }
    }

    /**
     * 근무시간 커스터마이징을 생성한다
     */
    constructor(
        date: string,
        start_work_time?: string,
        end_work_time?: string,
        reason?: string,
    ) {
        super();
        this.date = date;
        this.start_work_time = start_work_time || null;
        this.end_work_time = end_work_time || null;
        this.reason = reason || null;
        this.validateInvariants();
    }

    /**
     * 근무시간 커스터마이징을 업데이트한다
     */
    업데이트한다(
        start_work_time?: string,
        end_work_time?: string,
        reason?: string,
    ): void {
        if (start_work_time !== undefined) {
            this.start_work_time = start_work_time;
        }
        if (end_work_time !== undefined) {
            this.end_work_time = end_work_time;
        }
        if (reason !== undefined) {
            this.reason = reason;
        }
        this.validateInvariants();
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): WorkTimeOverrideDTO {
        return {
            id: this.id,
            date: this.date,
            startWorkTime: this.start_work_time,
            endWorkTime: this.end_work_time,
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
