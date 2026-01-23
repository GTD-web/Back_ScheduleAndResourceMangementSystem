import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ExcelImportProcessEntity {
    @PrimaryGeneratedColumn('uuid')
    excelImportProcessId: string;

    // 프로세스 상 필요한 부서정보 json
    @Column({ type: 'json' })
    @ApiProperty({
        description: '프로세스 상 필요한 부서정보 json',
        example: '{"extractedDepartments": [], "undefinedDepartments": [], "departments": [], "newDepartments": []}',
    })
    departmentInfoJson: string;

    // 프로세스 상 필요한 직원정보 json
    @Column({ type: 'json' })
    @ApiProperty({
        description: '프로세스 상 필요한 직원정보 json',
        example:
            '{"tempEnteredEmployeeInfoList": [], "tempExitedEmployeeInfoList": [], "enteredEmployeeInfoList": [], "ExitedEmployeeInfoList": []}',
    })
    employeeInfoJson: string;

    @Column({ type: 'json' })
    @ApiProperty({
        description: '프로세스 중 선택된 데이터 json',
        example: '{"extractedExcelDataList": [], "selectedDataList": []}',
    })
    dataJson: string;

    @Column('simple-json', {
        nullable: true,
    })
    @ApiProperty({
        description: '원본 데이터',
        example: [
            {
                employeeNumber: '1234567890',
                name: 'John Doe',
                department: 'Sales',
                events: [],
                attendanceRecords: [],
            },
        ],
    })
    extractedExcelDataList: any[];

    // 프로세스 진행 상태
    @Column()
    status: string;

    // 진행하는 프로세스의 연,월
    @Column()
    year: string;

    @Column()
    month: string;

    // 참조되는 event-info 파일 ID
    @Column({ nullable: true })
    eventInfoFileId: string;

    // 참조되는 used-attendance 파일 ID
    @Column({ nullable: true })
    usedAttendanceFileId: string;

    @CreateDateColumn()
    createdAt: Date;

    // user와 관계설정
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'userId' })
    user: UserEntity;
}
