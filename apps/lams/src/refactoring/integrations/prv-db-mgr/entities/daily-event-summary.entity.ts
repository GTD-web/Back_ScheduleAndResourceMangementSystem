import { BeforeInsert, BeforeUpdate, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmployeeInfoEntity } from './employee-info.entity';

@Entity()
@Index(['date', 'employee'])
export class DailyEventSummaryEntity {
    @PrimaryGeneratedColumn('uuid')
    dailyEventSummaryId: string;

    @Column({ type: 'date' })
    date: string;

    @ManyToOne(() => EmployeeInfoEntity, (employee) => employee.dailyEventSummaries, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    employee: EmployeeInfoEntity;

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

export type IUsedAttendance = {
    usedAttendanceId: string;
    attendanceTypeId: string;
    title: string;
};

// DailyEventSummaryEntity의 모든 속성을 포함하고 'usedAttendances' 필드를 추가하는 타입
export type T_DailySummary = Omit<
    DailyEventSummaryEntity,
    'employee' | 'calculateWorkTime' | 'inputEventTime' | 'updateNote' | 'resetEventTime'
> & {
    usedAttendances: IUsedAttendance[];
};