import { AfterLoad, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DataSnapshotInfoEntity } from './data-snapshot-info.entity';

type ParentDataType = {
    employeeId: string;
    employeeName: string;
    employeeNumber: string;
    yyyymm: string;
};

@Entity()
export class DataSnapshotChildInfoEntity {
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

    @ManyToOne(() => DataSnapshotInfoEntity, (snapshot) => snapshot.dataSnapshotChildInfoList, { onDelete: 'CASCADE' })
    parentSnapshot: DataSnapshotInfoEntity;

    @CreateDateColumn()
    createdAt: string;

    @AfterLoad()
    parseToJSON() {
        this.snapshotData = JSON.parse(this.snapshotData);
    }

    static createChildSnapshotListFromParent(snapshotData: ParentDataType[]) {
        return snapshotData.map((data) => {
            const dataSnapshotChildEntity = new DataSnapshotChildInfoEntity();

            dataSnapshotChildEntity.employeeId = data.employeeId;
            dataSnapshotChildEntity.employeeName = data.employeeName;
            dataSnapshotChildEntity.employeeNumber = data.employeeNumber;
            dataSnapshotChildEntity.yyyy = data.yyyymm.slice(0, 4);
            dataSnapshotChildEntity.mm = data.yyyymm.slice(5, 7);
            dataSnapshotChildEntity.snapshotData = JSON.stringify(data);

            return dataSnapshotChildEntity;
        });
    }
}
