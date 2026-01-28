import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { WageCalculationTypeDTO, CalculationType } from './wage-calculation-type.types';

/**
 * 임금 계산 유형 엔티티
 *
 * 전사적으로 적용되는 통상임금제/포괄임금제 상태를 기간별로 관리합니다.
 * 언제든 변경 가능하며, 변경 시 이전 상태의 종료시점과 새 상태의 시작점이 있습니다.
 */
@Entity('wage_calculation_types')
@Index(['start_date'])
@Index(['changed_at'])
@Index(['is_currently_applied'])
export class WageCalculationType extends BaseEntity<WageCalculationTypeDTO> {
    // BaseEntity에서 id, created_at, updated_at, deleted_at, created_by, updated_by, version 제공

    @Column({
        name: 'calculation_type',
        type: 'varchar',
        length: 30,
        comment: '임금 계산 유형 (REGULAR_WAGE: 통상임금제, COMPREHENSIVE_WAGE: 포괄임금제)',
    })
    calculation_type: CalculationType;

    @Column({
        name: 'start_date',
        type: 'date',
        comment: '시작일 (yyyy-MM-dd)',
    })
    start_date: string;

    @Column({
        name: 'changed_at',
        type: 'timestamp with time zone',
        comment: '변경일시',
    })
    changed_at: Date;

    @Column({
        name: 'is_currently_applied',
        type: 'boolean',
        default: false,
        comment: '현재 적용 중 여부',
    })
    is_currently_applied: boolean;

    /**
     * 임금 계산 유형 불변성 검증
     */
    private validateInvariants(): void {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateEnumValues();
        this.validateLogicalConsistency();
    }

    /**
     * 필수 데이터 검증
     */
    private validateRequiredData(): void {
        // TypeORM 메타데이터 검증 단계에서는 검증을 건너뜀
        if (!this.calculation_type || !this.start_date || !this.changed_at) {
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
    }

    /**
     * 열거형 값 유효성 검증
     */
    private validateEnumValues(): void {
        // 임금 계산 유형 검증
        if (this.calculation_type) {
            if (!Object.values(CalculationType).includes(this.calculation_type)) {
                throw new Error(`임금 계산 유형은 ${Object.values(CalculationType).join(', ')} 중 하나여야 합니다.`);
            }
        }
    }

    /**
     * 논리적 일관성 검증
     */
    private validateLogicalConsistency(): void {
        // 시작일과 변경일시의 일관성 검증
        if (this.start_date && this.changed_at) {
            const startDate = new Date(this.start_date);
            const changedAtDate = new Date(this.changed_at);

            // 시작일이 변경일시보다 이후일 수는 없음 (일반적으로 변경일시가 시작일과 같거나 이후)
            if (startDate > changedAtDate) {
                throw new Error('시작일은 변경일시보다 이전이거나 같아야 합니다.');
            }
        }
    }

    /**
     * 임금 계산 유형을 생성한다
     */
    constructor(
        calculation_type: CalculationType,
        start_date: string,
        changed_at?: Date,
        is_currently_applied?: boolean,
    ) {
        super();
        this.calculation_type = calculation_type;
        this.start_date = start_date;
        this.changed_at = changed_at || new Date();
        this.is_currently_applied = is_currently_applied ?? false;
        this.validateInvariants();
    }

    /**
     * 임금 계산 유형을 업데이트한다
     */
    업데이트한다(
        calculation_type?: CalculationType,
        start_date?: string,
        changed_at?: Date,
        is_currently_applied?: boolean,
    ): void {
        if (calculation_type !== undefined) {
            this.calculation_type = calculation_type;
        }
        if (start_date !== undefined) {
            this.start_date = start_date;
        }
        if (changed_at !== undefined) {
            this.changed_at = changed_at;
        }
        if (is_currently_applied !== undefined) {
            this.is_currently_applied = is_currently_applied;
        }
        this.validateInvariants();
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): WageCalculationTypeDTO {
        return {
            id: this.id,
            calculationType: this.calculation_type,
            startDate: this.start_date,
            changedAt: this.changed_at,
            isCurrentlyApplied: this.is_currently_applied,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
}
