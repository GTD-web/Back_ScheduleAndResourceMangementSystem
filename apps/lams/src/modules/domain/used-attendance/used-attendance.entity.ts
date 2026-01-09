import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../employee/employee.entity';
import { AttendanceType } from '../attendance-type/attendance-type.entity';

@Entity('used_attendance')
@Index(['employee', 'usedAt', 'attendanceType'], { unique: true })
export class UsedAttendance {
    @PrimaryGeneratedColumn('uuid')
    usedAttendanceId: string;

    @Column()
    usedAt: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @Column()
    employeeId: string;

    @Column()
    attendanceTypeId: string;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: 'employeeId' })
    employee: Employee;

    @ManyToOne(() => AttendanceType)
    @JoinColumn({ name: 'attendanceTypeId' })
    attendanceType: AttendanceType;

    updateUsedAttendance(dto: { usedAt: string; attendanceType: AttendanceType }) {
        for (const key in dto) {
            if (dto[key]) {
                this[key] = dto[key];
            }
        }
    }
}
