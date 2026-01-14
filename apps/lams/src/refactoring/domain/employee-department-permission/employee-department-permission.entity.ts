import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '@libs/database/base/base.entity';
import { Employee } from '@libs/modules/employee/employee.entity';
import { Department } from '@libs/modules/department/department.entity';
import { EmployeeDepartmentPermissionDTO } from './employee-department-permission.types';

/**
 * 직원-부서 권한 엔티티
 *
 * 직원과 부서 간의 접근권한 및 검토권한을 관리하는 중간 테이블
 */
@Entity('employee_department_permission')
@Unique(['employee_id', 'department_id'])
@Index(['employee_id'])
@Index(['department_id'])
@Index(['has_access_permission'])
@Index(['has_review_permission'])
export class EmployeeDepartmentPermission extends BaseEntity<EmployeeDepartmentPermissionDTO> {
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
     * 부서 ID (외래키)
     */
    @Column({ name: 'department_id', type: 'uuid' })
    department_id: string;

    /**
     * 부서 엔티티와의 관계
     */
    @ManyToOne(() => Department, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'department_id' })
    department: Department;

    /**
     * 접근 권한
     * 해당 부서의 데이터에 접근할 수 있는 권한
     */
    @Column({
        name: 'has_access_permission',
        type: 'boolean',
        default: false,
        comment: '접근 권한',
    })
    has_access_permission: boolean;

    /**
     * 검토 권한
     * 해당 부서의 데이터를 검토할 수 있는 권한
     */
    @Column({
        name: 'has_review_permission',
        type: 'boolean',
        default: false,
        comment: '검토 권한',
    })
    has_review_permission: boolean;

    /**
     * 직원-부서 권한 불변성 검증
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
        if (!this.employee_id || !this.department_id) {
            return;
        }

        this.validateUuidFormat(this.employee_id, 'employee_id');
        this.validateUuidFormat(this.department_id, 'department_id');
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
     * 직원-부서 권한을 생성한다
     */
    constructor(
        employee_id: string,
        department_id: string,
        has_access_permission: boolean = false,
        has_review_permission: boolean = false,
    ) {
        super();
        this.employee_id = employee_id;
        this.department_id = department_id;
        this.has_access_permission = has_access_permission;
        this.has_review_permission = has_review_permission;
        this.validateInvariants();
    }

    /**
     * 직원-부서 권한을 업데이트한다
     */
    업데이트한다(has_access_permission?: boolean, has_review_permission?: boolean): void {
        if (has_access_permission !== undefined) {
            this.has_access_permission = has_access_permission;
        }
        if (has_review_permission !== undefined) {
            this.has_review_permission = has_review_permission;
        }
        this.validateInvariants();
    }

    /**
     * DTO로 변환한다
     */
    DTO변환한다(): EmployeeDepartmentPermissionDTO {
        return {
            id: this.id,
            employeeId: this.employee_id,
            departmentId: this.department_id,
            hasAccessPermission: this.has_access_permission,
            hasReviewPermission: this.has_review_permission,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
}
