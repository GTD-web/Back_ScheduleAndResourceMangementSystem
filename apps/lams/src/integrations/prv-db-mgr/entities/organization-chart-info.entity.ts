import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OrganizationChartInfoEntity {
    @PrimaryGeneratedColumn('uuid')
    orgChartInfoId: string;

    @Column({ type: 'boolean', default: false })
    isSupport: boolean;

    @Column({ type: 'float', nullable: true })
    positionX: number;

    @Column({ type: 'float', nullable: true })
    positionY: number;
}
