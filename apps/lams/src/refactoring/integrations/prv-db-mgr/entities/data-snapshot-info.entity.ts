import { DataSnapshotChildInfoEntity } from './data-snapshot-child.entity';
import { DepartmentInfoEntity } from './department-info.entity';
import {
    AfterLoad,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { DataSnapshotApprovalRequestInfoEntity } from './approval/data-snapshot-approval-request-info.entity';

export enum SnapshotType {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    ANNUAL = 'ANNUAL_LEAVE',
}

@Entity()
export class DataSnapshotInfoEntity {
    @PrimaryGeneratedColumn('uuid')
    dataSnapshotId: string;

    @Column()
    snapshotName: string;

    @Column({ default: '' })
    description: string;

    @Column({ type: 'text' })
    snapshotType: SnapshotType;

    @Column()
    yyyy: string;

    @Column()
    mm: string;

    @OneToMany(() => DataSnapshotChildInfoEntity, (child) => child.parentSnapshot, {
        cascade: ['insert', 'update', 'remove'],
    })
    dataSnapshotChildInfoList: DataSnapshotChildInfoEntity[];
    /* TODO: 추후 제거 예정 - 2025-01-07*/
    @ManyToOne(() => DepartmentInfoEntity, { eager: true, cascade: true })
    @JoinColumn({ name: 'departmentId' })
    department: DepartmentInfoEntity;

    @OneToOne(() => DataSnapshotApprovalRequestInfoEntity, (approvalRequest) => approvalRequest.dataSnapshot)
    approvalRequest: DataSnapshotApprovalRequestInfoEntity;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    updateSnapshot(dto: any) {
        this.snapshotName = dto.snapshotName;
        this.description = dto.snapshotDescription;
    }

    @AfterLoad()
    afterLoadFunction() {
        this.createdAt = new Date(this.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

        if (this.dataSnapshotChildInfoList) {
            this.dataSnapshotChildInfoList.sort((a, b) => a.employeeName.localeCompare(b.employeeName, 'ko'));
        }
    }

    static createSnapshot({
        snapshotName,
        description,
        snapshotType,
        yyyy,
        mm,
        department,
        dataSnapshotChildInfoList,
    }: {
        snapshotName: string;
        description: string;
        snapshotType: SnapshotType;
        yyyy: string;
        mm: string;
        department: DepartmentInfoEntity;
        dataSnapshotChildInfoList: DataSnapshotChildInfoEntity[];
    }) {
        const snapshot = new DataSnapshotInfoEntity();
        snapshot.snapshotName = snapshotName;
        snapshot.description = description;
        snapshot.snapshotType = snapshotType;
        snapshot.yyyy = yyyy;
        snapshot.mm = mm;
        snapshot.department = department;
        snapshot.dataSnapshotChildInfoList = dataSnapshotChildInfoList;
        return snapshot;
    }
}
