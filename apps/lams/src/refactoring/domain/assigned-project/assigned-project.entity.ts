import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { Employee } from '@libs/modules/employee/employee.entity';
import { Project } from '../project/project.entity';
import { AssignedProjectDTO } from './assigned-project.types';

/**
 * 할당된 프로젝트 엔티티
 *
 * 직원과 프로젝트의 중간테이블
 * 직원이 어떤 프로젝트에 할당되었는지 관리
 */
@Entity('assigned_projects')
@Index(['employee_id', 'project_id'], { unique: true })
@Index(['employee_id'])
@Index(['project_id'])
export class AssignedProject extends BaseEntity<AssignedProjectDTO> {
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
     * 프로젝트 ID (외래키)
     */
    @Column({ name: 'project_id', type: 'uuid' })
    project_id: string;

    /**
     * 프로젝트 엔티티와의 관계
     */
    @ManyToOne(() => Project, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    /**
     * 할당 시작일
     */
    @Column({
        name: 'start_date',
        type: 'date',
        nullable: true,
        comment: '할당 시작일',
    })
    start_date: string | null;

    /**
     * 할당 종료일
     */
    @Column({
        name: 'end_date',
        type: 'date',
        nullable: true,
        comment: '할당 종료일',
    })
    end_date: string | null;

    /**
     * 활성화 여부
     */
    @Column({
        name: 'is_active',
        type: 'boolean',
        default: true,
        comment: '활성화 여부',
    })
    is_active: boolean;

    /**
     * 할당된 프로젝트 불변성 검증
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
        if (!this.employee_id || !this.project_id) {
            return;
        }

        this.validateUuidFormat(this.employee_id, 'employee_id');
        this.validateUuidFormat(this.project_id, 'project_id');
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
        // 시작일과 종료일 검증
        if (this.start_date && this.end_date) {
            if (new Date(this.start_date) > new Date(this.end_date)) {
                throw new Error('할당 시작일은 종료일보다 이전이어야 합니다.');
            }
        }
    }

    /**
     * 할당된 프로젝트를 생성한다
     */
    constructor(
        employee_id: string,
        project_id: string,
        start_date?: string,
        end_date?: string,
        is_active: boolean = true,
    ) {
        super();
        this.employee_id = employee_id;
        this.project_id = project_id;
        this.start_date = start_date || null;
        this.end_date = end_date || null;
        this.is_active = is_active;
        this.validateInvariants();
    }

    /**
     * 할당된 프로젝트 정보를 업데이트한다
     */
    업데이트한다(
        start_date?: string,
        end_date?: string,
        is_active?: boolean,
    ): void {
        if (start_date !== undefined) {
            this.start_date = start_date;
        }
        if (end_date !== undefined) {
            this.end_date = end_date;
        }
        if (is_active !== undefined) {
            this.is_active = is_active;
        }
        this.validateInvariants();
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): AssignedProjectDTO {
        return {
            id: this.id,
            employeeId: this.employee_id,
            projectId: this.project_id,
            startDate: this.start_date,
            endDate: this.end_date,
            isActive: this.is_active,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
}
