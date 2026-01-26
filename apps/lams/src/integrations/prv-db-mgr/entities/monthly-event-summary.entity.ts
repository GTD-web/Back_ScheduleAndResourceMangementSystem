import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class MonthlyEmployeeAttendanceInfoEntity {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({
        description: '월별 이벤트 요약 아이디',
        example: 'exMonthlyEventSummaryId',
    })
    monthlyEventSummaryId: string;

    @Column()
    @ApiProperty({
        description: '사원 번호',
        example: '23027',
    })
    employeeNumber: string;

    @Column()
    @ApiProperty({
        description: '사원 고유 아이디',
        example: 'exEmployeeId',
    })
    employeeId: string;

    @Column({
        nullable: true,
    })
    @ApiProperty({
        description: '사원 이름',
        example: '홍길동',
    })
    employeeName: string;

    @Column()
    @ApiProperty({
        description: '해당 월의 첫 날',
        example: '2023-07',
    })
    yyyymm: string;

    @Column({ nullable: true })
    @ApiProperty({
        description: '비고',
        example: '휴가 1일 사용',
    })
    note?: string;

    @Column({ default: '' })
    @ApiProperty({
        description: '월간 근태 요약 노트',
        example: '휴가 1일 사용',
    })
    additionalNote?: string;

    @Column()
    @ApiProperty({
        description: '근무 일수',
        example: 22,
    })
    workDaysCount: number;

    @Column('int', {
        nullable: true,
    })
    @ApiProperty({
        description: '총 업무 가능 시간 (분 단위)',
        example: 12801,
    })
    totalWorkableTime: number;

    @Column('int')
    @ApiProperty({
        description: '총 근무 시간 (분 단위)',
        example: 12801,
    })
    totalWorkTime: number;

    @Column('float')
    @ApiProperty({
        description: '평균 근무 시간 (분 단위)',
        example: 581.86,
    })
    avgWorkTimes: number;

    @Column('simple-json')
    @ApiProperty({
        description: '근태 유형별 횟수',
        example: {
            연차: 1,
            오전반차: 0,
            오후반차: 0,
            // ... 기타 근태 유형
        },
    })
    attendanceTypeCount: Record<string, number>;

    @Column('simple-json', {
        nullable: true,
    })
    @ApiProperty({
        description: '일별 이벤트 요약',
        example: [
            {
                dailyEventSummaryId: '8a5a35e8-46fd-458f-9ccf-843404b5e0c8',
                date: '2024-06-01',
                enter: '2024-06-01 09:05:30',
                leave: '2024-06-01 17:58:50',
                workTime: 533,
                usedAttendances: [],
            },
            // ... other daily summaries
        ],
    })
    dailyEventSummary: any[];

    @Column('simple-json', {
        nullable: true,
    })
    @ApiProperty({
        description: '주별 이벤트 요약',
        example: [
            {
                weekNumber: 21,
                startDate: '2024-05-26',
                endDate: '2024-06-01',
                weeklyWorkTime: 533,
            },
        ],
    })
    weeklyWorkTimeSummary: any[];

    @Column('simple-json', {
        nullable: true,
    })
    @ApiProperty({
        description: '지각 상세정보',
        example: [
            {
                dailyEventSummaryId: '8a5a35e8-46fd-458f-9ccf-843404b5e0c8',
                date: '2024-06-01',
                enter: '2024-06-01 09:05:30',
                leave: '2024-06-01 17:58:50',
                workTime: 533,
                usedAttendances: [],
            },
        ],
    })
    lateDetails: any[];

    @Column('simple-json', {
        nullable: true,
    })
    @ApiProperty({
        description: '결근 상세정보',
        example: [
            {
                dailyEventSummaryId: '8a5a35e8-46fd-458f-9ccf-843404b5e0c8',
                date: '2024-06-01',
                enter: '2024-06-01 09:05:30',
                leave: '2024-06-01 17:58:50',
                workTime: 533,
                usedAttendances: [],
            },
        ],
    })
    absenceDetails: any[];

    @Column('simple-json', {
        nullable: true,
    })
    @ApiProperty({
        description: '조퇴 상세정보',
        example: [
            {
                dailyEventSummaryId: '8a5a35e8-46fd-458f-9ccf-843404b5e0c8',
                date: '2024-06-01',
                enter: '2024-06-01 09:05:30',
                leave: '2024-06-01 17:58:50',
                workTime: 533,
                usedAttendances: [],
            },
        ],
    })
    earlyLeaveDetails: any[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    updateSummary(params: {
        employeeInfo: { employeeNumber: string; employeeId: string; employeeName: string };
        yyyymm: string;
        totalWorkableTime: number;
        totalWorkTime: number;
        workDaysCount: number;
        avgWorkTimes: number;
        attendanceTypeCount: Record<string, number>;
        weeklyWorkTimeSummary: any[];
        dailyEventSummary: any[];
        lateDetails: any[];
        absenceDetails: any[];
        earlyLeaveDetails: any[];
        note: string;
    }) {
        this.employeeNumber = params.employeeInfo.employeeNumber;
        this.employeeId = params.employeeInfo.employeeId;
        this.employeeName = params.employeeInfo.employeeName;
        this.yyyymm = params.yyyymm;
        this.totalWorkableTime = params.totalWorkableTime;
        this.totalWorkTime = params.totalWorkTime;
        this.workDaysCount = params.workDaysCount;
        this.avgWorkTimes = params.avgWorkTimes;
        this.attendanceTypeCount = params.attendanceTypeCount;
        this.weeklyWorkTimeSummary = params.weeklyWorkTimeSummary;
        this.dailyEventSummary = params.dailyEventSummary;
        this.lateDetails = params.lateDetails;
        this.absenceDetails = params.absenceDetails;
        this.earlyLeaveDetails = params.earlyLeaveDetails;
        this.note = params.note;
    }

    static create(params: {
        employeeInfo: { employeeNumber: string; employeeId: string; employeeName: string };
        yyyymm: string;
        totalWorkableTime: number;
        totalWorkTime: number;
        workDaysCount: number;
        avgWorkTimes: number;
        attendanceTypeCount: Record<string, number>;
        weeklyWorkTimeSummary: any[];
        dailyEventSummary: any[];
        lateDetails: any[];
        absenceDetails: any[];
        earlyLeaveDetails: any[];
        note: string;
    }): MonthlyEmployeeAttendanceInfoEntity {
        const entity = new MonthlyEmployeeAttendanceInfoEntity();
        entity.updateSummary(params);
        return entity;
    }
}
