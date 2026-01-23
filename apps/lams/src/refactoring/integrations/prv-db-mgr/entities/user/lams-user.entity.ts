import { ChildEntity, Column, ManyToMany, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';
import { DepartmentInfoEntity } from '../department-info.entity';
import { ApprovalRequestBaseInfoEntity } from '../approval/approval-request-info.entity';
import { ApprovalStepInfoEntity } from '../approval/approval-step-info.entity';

export enum LamsUserRole {
    ATTENDANCE_ADMIN = 'ATTENDANCE_ADMIN',
    ATTENDANCE_USER = 'ATTENDANCE_USER',
}

@ChildEntity()
export class LamsUserEntity extends UserEntity {
    constructor() {
        super();
    }

    @Column({ default: false })
    hasAccessAuthority: boolean;

    @Column({ default: false })
    hasReviewAuthority: boolean;

    @ManyToMany(() => DepartmentInfoEntity, (department) => department.accessAuthorities)
    accessableDepartments: DepartmentInfoEntity[];

    @ManyToMany(() => DepartmentInfoEntity, (department) => department.reviewAuthorities)
    reviewableDepartments: DepartmentInfoEntity[];

    @OneToMany(() => ApprovalRequestBaseInfoEntity, (request) => request.requester)
    requests: ApprovalRequestBaseInfoEntity[];

    @OneToMany(() => ApprovalStepInfoEntity, (step) => step.approver)
    approvalSteps: ApprovalStepInfoEntity[];

    setLamsRoles(role: LamsUserRole) {
        // 기존 역할 제거
        this.roles = this.roles.filter(
            (r) => r !== LamsUserRole.ATTENDANCE_ADMIN && r !== LamsUserRole.ATTENDANCE_USER,
        );

        // 새로운 역할 추가
        this.roles.push(role);
    }

    includeAccessableDepartment(department: DepartmentInfoEntity) {
        if (!this.accessableDepartments) {
            this.accessableDepartments = [];
        }

        if (!this.isAccessableDepartment(department)) {
            this.accessableDepartments.push(department);
        }
    }

    includeReviewableDepartment(department: DepartmentInfoEntity) {
        if (!this.reviewableDepartments) {
            this.reviewableDepartments = [];
        }

        if (!this.isReviewableDepartment(department)) {
            this.reviewableDepartments.push(department);
        }
    }

    excludeAccessableDepartment(department: DepartmentInfoEntity) {
        this.accessableDepartments = this.accessableDepartments.filter(
            (dept) => dept.departmentId !== department.departmentId,
        );
    }

    excludeReviewableDepartment(department: DepartmentInfoEntity) {
        this.reviewableDepartments = this.reviewableDepartments.filter(
            (dept) => dept.departmentId !== department.departmentId,
        );
    }

    isAccessableDepartment(department: DepartmentInfoEntity) {
        return this.accessableDepartments.some((dept) => dept.departmentId === department.departmentId);
    }

    isReviewableDepartment(department: DepartmentInfoEntity) {
        return this.reviewableDepartments.some((dept) => dept.departmentId === department.departmentId);
    }
}
