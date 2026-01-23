import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AttendanceTypeEntity {
    @PrimaryGeneratedColumn('uuid')
    attendanceTypeId?: string;

    @Column()
    title: string;

    @Column()
    workTime: number;

    @Column()
    isRecognizedWorkTime: boolean;

    @Column({
        nullable: true,
    })
    startWorkTime: string;

    @Column({
        nullable: true,
    })
    endWorkTime: string;

    @Column({ type: 'float', default: 0 })
    deductedAnnualLeave: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    updateAttendanceTypeEntity(dto: Partial<AttendanceTypeEntity>) {
        for (const key in dto) {
            if (dto[key]) {
                this[key] = dto[key];
            }
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    calculateWorkTime() {
        if (this.workTime < 60) this.workTime = this.workTime * 60;
    }
}
