import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Gender, EmployeeStatus } from '../../../common/enums/employee.enum';
import { Role } from '../../../common/enums/role-type.enum';
import { Rank } from '../rank/rank.entity';
import { EmployeeDepartmentPosition } from '../employee-department-position/employee-department-position.entity';
import { DailyEventSummary } from '../daily-event-summary/daily-event-summary.entity';

@Entity('employees')
export class Employee {
    @PrimaryColumn({ type: 'uuid', comment: '직원 ID (외부 제공)' })
    id: string;

    // 기존 코드와의 호환성을 위한 getter
    get employeeId(): string {
        return this.id;
    }

    @Column({ unique: true, comment: '사번' })
    employeeNumber: string;

    @Column({ comment: '이름' })
    name: string;

    @Column({ unique: true, comment: '이메일', nullable: true })
    email?: string;

    @Column({ comment: '비밀번호', nullable: true, select: false })
    password?: string;

    @Column({ comment: '전화번호', nullable: true })
    phoneNumber?: string;

    @Column({ comment: '생년월일', type: 'date', nullable: true })
    dateOfBirth?: Date;

    @Column({
        comment: '성별',
        type: 'enum',
        enum: Gender,
        nullable: true,
    })
    gender?: Gender;

    @Column({ comment: '입사일', type: 'date' })
    hireDate: Date;

    @Column({
        comment: '재직 상태',
        type: 'enum',
        enum: EmployeeStatus,
        default: EmployeeStatus.Active,
    })
    status: EmployeeStatus;

    // 직급 관계
    @Column({ comment: '현재 직급 ID', type: 'uuid', nullable: true })
    currentRankId?: string;

    @ManyToOne(() => Rank, { eager: true })
    @JoinColumn({ name: 'currentRankId' })
    currentRank?: Rank;

    @Column({ comment: '퇴사일', type: 'date', nullable: true })
    terminationDate?: Date;

    @Column({ comment: '퇴사 사유', type: 'text', nullable: true })
    terminationReason?: string;

    @Column({ comment: '초기 비밀번호 설정 여부', default: false })
    isInitialPasswordSet: boolean;

    // 부서-직책 관계
    @OneToMany(() => EmployeeDepartmentPosition, (edp) => edp.employee)
    departmentPositions?: EmployeeDepartmentPosition[];

    // 현재 서버에서 관리하는 필드들 (인증/권한)
    @Column({ type: 'enum', enum: Role, array: true, default: [Role.USER], comment: '사용자 역할' })
    roles: Role[];

    @OneToMany(() => DailyEventSummary, (dailyEventSummary) => dailyEventSummary.employee)
    dailyEventSummary: DailyEventSummary[];

    @CreateDateColumn({ comment: '생성일' })
    createdAt: Date;

    @UpdateDateColumn({ comment: '수정일' })
    updatedAt: Date;
}
