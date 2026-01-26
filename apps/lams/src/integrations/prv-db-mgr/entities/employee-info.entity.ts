import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DailyEventSummaryEntity } from './daily-event-summary.entity';
import { DepartmentInfoEntity } from './department-info.entity';
import { DepartmentEmployeeEntity } from './department-employee.entity';

@Entity()
export class EmployeeInfoEntity {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({
        description: '직원 아이디',
        example: 'exEmployeeId',
    })
    employeeId?: string;

    @Column({
        nullable: true,
    })
    @ApiProperty({
        description: '직원 이름',
        example: 'exEmployeeName',
    })
    employeeName: string;

    @Column()
    @ApiProperty({
        description: '사번',
        example: 'exEmployeeNumber',
    })
    employeeNumber: string;

    @Column({
        nullable: true,
    })
    @ApiProperty({
        description: '직원 이메일',
        example: 'exEmployeeEmail',
    })
    email: string;

    @Column({
        type: 'date',
        nullable: true,
    })
    @ApiProperty({
        description: '입사일',
        example: '2021-01-01',
    })
    entryAt: string;

    /* TODO: 추후 제거 예정 - 2025-01-07*/
    @ManyToOne(() => DepartmentInfoEntity)
    @JoinColumn({ name: 'departmentId' })
    @ApiProperty({
        description: '부서',
        example: 'exDepartment',
    })
    department: DepartmentInfoEntity;

    @Column({ type: 'date', nullable: true })
    @ApiProperty({
        description: '생일',
        example: '1990-01-01',
        required: false,
    })
    birthDate: string;

    @Column({ nullable: true })
    @ApiProperty({
        description: '퇴사일',
        example: '2023-12-31',
        required: false,
    })
    quitedAt: string;

    @OneToMany(() => DailyEventSummaryEntity, (dailyEventSummary) => dailyEventSummary.employee, {
        cascade: true,
        nullable: true,
    })
    dailyEventSummaries: DailyEventSummaryEntity[];

    @Column({ type: 'boolean', default: false })
    @ApiProperty({
        description: '계산에서 제외할지 여부',
        example: false,
        required: false,
    })
    isExcludedFromCalculation: boolean;

    @OneToMany(() => DepartmentEmployeeEntity, (employee) => employee.employee)
    departments: DepartmentEmployeeEntity[];
}
