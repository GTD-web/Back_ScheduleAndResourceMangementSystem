import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { BaseEntity } from '@libs/database/base/base.entity';
import { DailyEventSummary } from '../daily-event-summary/daily-event-summary.entity';
import { DailySummaryChangeHistoryDTO } from './daily-summary-change-history.types';

/**
 * 일간 요약 변경 이력 엔티티
 *
 * 일간 요약 데이터가 변경되는 과정을 추적하는 이력 테이블
 */
@Entity('daily_summary_change_history')
@Index(['daily_event_summary_id', 'changed_at'])
export class DailySummaryChangeHistory extends BaseEntity<DailySummaryChangeHistoryDTO> {
    // BaseEntity에서 id, created_at, updated_at, deleted_at, created_by, updated_by, version 제공

    /**
     * 일간 요약 ID (외래키)
     */
    @Column({ name: 'daily_event_summary_id', type: 'uuid' })
    daily_event_summary_id: string;

    /**
     * 일간 요약 엔티티와의 관계
     */
    @ManyToOne(() => DailyEventSummary, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'daily_event_summary_id' })
    dailyEventSummary: DailyEventSummary;

    /**
     * 날짜
     * 변경된 일간 요약의 날짜
     */
    @Column({
        name: 'date',
        type: 'date',
        comment: '날짜',
    })
    date: string;

    /**
     * 변경 내역
     * 변경된 내용에 대한 상세 설명
     */
    @Column({
        name: 'content',
        type: 'text',
        comment: '변경 내역',
    })
    content: string;

    /**
     * 변경자 (사용자 UUID)
     */
    @Column({
        name: 'changed_by',
        type: 'uuid',
        nullable: true,
        comment: '변경자',
    })
    changed_by: string | null;

    /**
     * 변경 시간
     * 실제 변경이 발생한 시점
     */
    @Column({
        name: 'changed_at',
        type: 'timestamp',
        comment: '변경 시간',
    })
    changed_at: Date;

    /**
     * 변경 사유
     * 변경이 발생한 이유 또는 목적
     */
    @Column({
        name: 'reason',
        type: 'text',
        nullable: true,
        comment: '변경 사유',
    })
    reason: string | null;

    /**
     * 스냅샷 ID
     * 데이터 스냅샷과의 연관 ID (관계 없이 단순 참조용)
     */
    @Column({
        name: 'snapshot_id',
        type: 'uuid',
        nullable: true,
        comment: '스냅샷 ID',
    })
    snapshot_id: string | null;

    /**
     * 일간 요약 변경 이력 불변성 검증
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
        if (!this.daily_event_summary_id || !this.date || !this.content || !this.changed_by) {
            return;
        }

        if (this.content.trim().length === 0) {
            throw new BadRequestException('변경 내역은 필수입니다.');
        }

        if (!this.changed_by) {
            return;
        }

        this.validateUuidFormat(this.daily_event_summary_id, 'daily_event_summary_id');
        this.validateUuidFormat(this.changed_by, 'changed_by');
    }

    /**
     * 데이터 형식 검증
     */
    private validateDataFormat(): void {
        // TypeORM 메타데이터 검증 단계에서는 검증을 건너뜀
        if (this.snapshot_id) {
            this.validateUuidFormat(this.snapshot_id, 'snapshot_id');
        }
    }

    /**
     * 논리적 일관성 검증
     */
    private validateLogicalConsistency(): void {
        // 추가적인 논리적 검증이 필요한 경우 여기에 구현
    }

    /**
     * 일간 요약 변경 이력을 생성한다
     */
    constructor(
        daily_event_summary_id: string,
        date: string,
        content: string,
        changed_by: string,
        reason?: string,
        snapshot_id?: string,
    ) {
        super();
        this.daily_event_summary_id = daily_event_summary_id;
        this.date = date;
        this.content = content;
        this.changed_by = changed_by;
        this.reason = reason || null;
        this.snapshot_id = snapshot_id || null;
        this.changed_at = new Date();
        this.validateInvariants();
    }

    /**
     * 일간 요약 변경 이력 정보를 업데이트한다
     */
    업데이트한다(content?: string, reason?: string, snapshot_id?: string): void {
        if (content !== undefined) {
            this.content = content;
        }
        if (reason !== undefined) {
            this.reason = reason;
        }
        if (snapshot_id !== undefined) {
            this.snapshot_id = snapshot_id;
        }
        this.validateInvariants();
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): DailySummaryChangeHistoryDTO {
        return {
            id: this.id,
            dailyEventSummaryId: this.daily_event_summary_id,
            date: this.date,
            content: this.content,
            changedBy: this.changed_by,
            changedAt: this.changed_at,
            reason: this.reason,
            snapshotId: this.snapshot_id,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
}
