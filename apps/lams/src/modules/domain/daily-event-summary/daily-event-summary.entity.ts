import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Employee } from '@libs/modules/employee/employee.entity';

@Entity('daily_event_summaries')
@Index(['date', 'employeeId'], { unique: true })
export class DailyEventSummary {
    @PrimaryGeneratedColumn('uuid')
    dailyEventSummaryId: string;

    @Column({ type: 'date' })
    date: string;

    @Column({ type: 'uuid', nullable: true })
    employeeId: string;

    @ManyToOne(() => Employee, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'employeeId' })
    employee: Employee;

    @Column({ type: 'boolean', default: false })
    isHoliday: boolean;

    // 보여주기용 출근 시간
    @Column({ nullable: true })
    enter: string;

    // 보여주기용 퇴근 시간
    @Column({ nullable: true })
    leave: string;

    // 실제 출근 시간
    @Column({ nullable: true })
    realEnter: string;

    // 실제 퇴근 시간

    @Column({ nullable: true })
    realLeave: string;

    // 검토 완료 여부
    @Column({ default: true })
    isChecked: boolean;

    // 지각 여부
    @Column({ default: false })
    isLate: boolean;

    // 조퇴 여부
    @Column({ default: false })
    isEarlyLeave: boolean;

    // 결근 여부
    @Column({ default: false })
    isAbsent: boolean;

    // 근무 시간
    @Column({ type: 'int', nullable: true })
    workTime: number;

    @Column({ nullable: true })
    note: string;

    @BeforeInsert()
    @BeforeUpdate()
    calculateWorkTime() {
        if (this.enter && this.leave && this.date) {
            const enterDate = new Date(`${this.date}T${this.enter}`);
            const leaveDate = new Date(`${this.date}T${this.leave}`);
            const diff = leaveDate.getTime() - enterDate.getTime();
            // Convert milliseconds to minutes
            this.workTime = Math.floor(diff / (1000 * 60));
        } else {
            this.workTime = null;
        }
    }

    inputEventTime(earliest: string, latest: string) {
        this.enter = earliest;
        this.leave = latest;
        this.realEnter = earliest;
        this.realLeave = latest;
        this.isAbsent = false;
        this.isLate = false;
        this.isEarlyLeave = false;
        this.isChecked = true;
        this.note = '';
    }

    resetEventTime() {
        this.enter = '';
        this.leave = '';
        this.realEnter = '';
        this.realLeave = '';
        this.isAbsent = false;
        this.isLate = false;
        this.isEarlyLeave = false;
        this.isChecked = true;
        this.note = '';
    }

    updateNote(note: string) {
        this.note = note;
    }
}
