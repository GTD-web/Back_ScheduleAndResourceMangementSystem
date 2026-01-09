import { AfterLoad, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DataSnapshotInfo } from '../data-snapshot-info/data-snapshot-info.entity';

type ParentDataType = {
    employeeId: string;
    employeeName: string;
    employeeNumber: string;
    yyyymm: string;
};

@Entity('data_snapshot_child')
export class DataSnapshotChild {
    @PrimaryGeneratedColumn('uuid')
    dataSnapshotChildId: string;

    @Column()
    employeeId: string;

    @Column()
    employeeName: string;

    @Column()
    employeeNumber: string;

    @Column()
    yyyy: string;

    @Column()
    mm: string;

    @Column({ type: 'json' })
    snapshotData: string;

    @ManyToOne(() => DataSnapshotInfo, (snapshot) => snapshot.dataSnapshotChildInfoList, { onDelete: 'CASCADE' })
    parentSnapshot: DataSnapshotInfo;

    @CreateDateColumn()
    createdAt: string;

    @AfterLoad()
    parseToJSON() {
        this.snapshotData = JSON.parse(this.snapshotData);
    }

    static createChildSnapshotListFromParent(snapshotData: ParentDataType[]) {
        return snapshotData.map((data) => {
            const dataSnapshotChild = new DataSnapshotChild();

            dataSnapshotChild.employeeId = data.employeeId;
            dataSnapshotChild.employeeName = data.employeeName;
            dataSnapshotChild.employeeNumber = data.employeeNumber;
            dataSnapshotChild.yyyy = data.yyyymm.slice(0, 4);
            dataSnapshotChild.mm = data.yyyymm.slice(5, 7);
            dataSnapshotChild.snapshotData = JSON.stringify(data);

            return dataSnapshotChild;
        });
    }
}
