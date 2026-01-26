import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { Employee } from '@libs/modules/employee/employee.entity';
import { EmployeeExtraInfoDTO } from './employee-extra-info.types';

/**
 * 직원 추가 정보 엔티티
 *
 * 직원의 추가 정보를 관리하는 엔티티 (대시보드 표시 여부 등)
 */
@Entity('employee_extra_info')
@Unique(['employee_id'])
@Index(['employee_id'])
@Index(['is_excluded_from_summary'])
export class EmployeeExtraInfo extends BaseEntity<EmployeeExtraInfoDTO> {
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
     * 대시보드 요약에서 제외 여부
     * true인 경우 대시보드 요약에서 제외됨
     */
    @Column({
        name: 'is_excluded_from_summary',
        type: 'boolean',
        default: false,
        comment: '대시보드 요약에서 제외 여부',
    })
    is_excluded_from_summary: boolean;

    /**
     * 직원 추가 정보 불변성 검증
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
        if (!this.employee_id) {
            return;
        }

        this.validateUuidFormat(this.employee_id, 'employee_id');
    }

    /**
     * 데이터 형식 검증
     */
    private validateDataFormat(): void {
        // boolean 타입은 TypeORM이 자동으로 처리하므로 추가 검증 불필요
    }

    /**
     * 논리적 일관성 검증
     */
    private validateLogicalConsistency(): void {
        // 추가적인 논리적 검증이 필요한 경우 여기에 구현
    }

    /**
     * 직원 추가 정보를 생성한다
     */
    constructor(employee_id: string, is_excluded_from_summary: boolean = false) {
        super();
        this.employee_id = employee_id;
        this.is_excluded_from_summary = is_excluded_from_summary;
        this.validateInvariants();
    }

    /**
     * 직원 추가 정보를 업데이트한다
     */
    업데이트한다(is_excluded_from_summary?: boolean): void {
        if (is_excluded_from_summary !== undefined) {
            this.is_excluded_from_summary = is_excluded_from_summary;
        }
        this.validateInvariants();
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): EmployeeExtraInfoDTO {
        return {
            id: this.id,
            employeeId: this.employee_id,
            isExcludedFromSummary: this.is_excluded_from_summary,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
}
