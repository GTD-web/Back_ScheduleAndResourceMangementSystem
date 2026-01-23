import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Repository,
    FindOptionsWhere,
    FindOptionsOrder,
    IsNull,
} from 'typeorm';
import { EmployeeInfoEntity } from './employee-info.entity';
import { LamsUserEntity } from './user/lams-user.entity';
import { OrganizationChartInfoEntity } from './organization-chart-info.entity';
import { DepartmentEmployeeEntity } from './department-employee.entity';

@Entity()
export class DepartmentInfoEntity {
    @PrimaryGeneratedColumn('uuid')
    departmentId: string;

    @Column()
    departmentName: string;

    @Column({ nullable: true })
    departmentCode: string;

    @Column({ nullable: true })
    mmsDepartmentId: string;

    // 기본값을 빈배열로 지정
    @ManyToMany(() => LamsUserEntity, (user) => user.accessableDepartments, {
        cascade: true,
        eager: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinTable({ name: 'accessAuthorities' })
    accessAuthorities: LamsUserEntity[];

    @ManyToMany(() => LamsUserEntity, (user) => user.reviewableDepartments, {
        cascade: true,
        eager: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinTable({ name: 'reviewAuthorities' })
    reviewAuthorities: LamsUserEntity[];

    @Column({ default: false })
    isExclude: boolean;

    @Column({ type: 'uuid', nullable: true })
    parentDepartmentId: string;

    @ManyToOne(() => DepartmentInfoEntity, (department) => department.children, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'parentDepartmentId' })
    parent: DepartmentInfoEntity;

    @OneToMany(() => DepartmentInfoEntity, (department) => department.parent)
    children: DepartmentInfoEntity[];

    @Column({ type: 'uuid', nullable: true })
    orgChartInfoId: string;

    @OneToOne(() => OrganizationChartInfoEntity, (department) => department.orgChartInfoId)
    @JoinColumn({ name: 'orgChartInfoId' })
    orgChartInfo: OrganizationChartInfoEntity;

    @OneToMany(() => DepartmentEmployeeEntity, (employee) => employee.department)
    employees: DepartmentEmployeeEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    private getAccessAuthorities(): LamsUserEntity[] {
        return this.accessAuthorities;
    }

    private getReviewAuthorities(): LamsUserEntity[] {
        return this.reviewAuthorities;
    }

    private setAccessAuthorities(authorities: LamsUserEntity[]): void {
        this.accessAuthorities = authorities;
    }

    private setReviewAuthorities(authorities: LamsUserEntity[]): void {
        this.reviewAuthorities = authorities;
    }

    toggleExclude() {
        this.isExclude = !this.isExclude;
    }

    isAccessAuthority(user: LamsUserEntity): boolean {
        return this.accessAuthorities.some((u) => u.userId === user.userId);
    }

    isReviewAuthority(user: LamsUserEntity): boolean {
        return this.reviewAuthorities.some((u) => u.userId === user.userId);
    }

    includeAccessAuthority(user: LamsUserEntity): void {
        if (!this.accessAuthorities) {
            this.accessAuthorities = [];
        }
        const isAccessAuthority = this.isAccessAuthority(user);
        if (!isAccessAuthority) {
            this.accessAuthorities.push(user);
        }
    }

    includeReviewAuthority(user: LamsUserEntity): void {
        if (!this.reviewAuthorities) {
            this.reviewAuthorities = [];
        }

        if (!this.isReviewAuthority(user)) {
            this.reviewAuthorities.push(user);
        }
    }

    excludeAccessAuthority(user: LamsUserEntity): void {
        try {
            const authorities = this.accessAuthorities.filter((u) => u.userId !== user.userId);
            this.setAccessAuthorities(authorities);
        } catch (error) {
            console.error(error);
        }
    }

    excludeReviewAuthority(user: LamsUserEntity): void {
        try {
            const authorities = this.reviewAuthorities.filter((u) => u.userId !== user.userId);
            this.setReviewAuthorities(authorities);
        } catch (error) {
            console.error(error);
        }
    }

    static async findDepartmentWithChildren(
        repository: Repository<DepartmentInfoEntity>,
        options: {
            departmentId?: string;
            withOrgChart?: boolean;
            withEmployees?: boolean;
            withChildren?: boolean;
            where?: FindOptionsWhere<DepartmentInfoEntity>;
            order?: FindOptionsOrder<DepartmentInfoEntity>;
        } = {},
    ) {
        const {
            departmentId,
            withOrgChart = false,
            withEmployees = true,
            withChildren = true,
            where = {},
            order,
        } = options;
        const relations: string[] = [];
        if (withEmployees)
            relations.push(
                'employees',
                'employees.employee',
                'employees.employee.departments',
                'employees.employee.departments.department',
            );
        if (withOrgChart) relations.push('orgChartInfo');
        if (withChildren) relations.push('children');

        if (departmentId) {
            where.departmentId = departmentId;
        } else {
            where.parentDepartmentId = IsNull();
        }

        const department = await repository.findOne({
            where,
            relations,
            order,
        });

        return this.getAllChildDepartments(repository, department, relations);
    }

    static async getAllChildDepartments(
        repository: Repository<DepartmentInfoEntity>,
        dept: DepartmentInfoEntity,
        relations: string[],
    ): Promise<DepartmentInfoEntity> {
        if (!dept.children?.length) return dept;

        const childDepts = await Promise.all(
            dept.children.map((child) =>
                repository.findOne({
                    where: { departmentId: child.departmentId },
                    relations,
                }),
            ),
        );

        dept.children = await Promise.all(
            childDepts.map((child) => this.getAllChildDepartments(repository, child, relations)),
        );
        return dept;
    }

    static async getAllEmployee(
        dept: DepartmentInfoEntity,
        options: {
            withQuited: boolean;
            withExclude: boolean;
        } = {
            withQuited: false,
            withExclude: true,
        },
    ): Promise<EmployeeInfoEntity[]> {
        const { withQuited, withExclude } = options;
        let currentDeptEmployees = dept.employees?.map((emp) => emp.employee) || [];

        if (!withQuited) {
            currentDeptEmployees = currentDeptEmployees.filter((emp) => emp.quitedAt === null || emp.quitedAt === '');
        }
        if (!withExclude) {
            currentDeptEmployees = currentDeptEmployees.filter((emp) => emp.isExcludedFromCalculation === false);
        }
        if (dept.children?.length) {
            const childDepts = (
                await Promise.all(dept.children.map((child) => this.getAllEmployee(child, options)))
            ).flat();

            return [...currentDeptEmployees, ...childDepts];
        }
        return currentDeptEmployees;
    }
}
