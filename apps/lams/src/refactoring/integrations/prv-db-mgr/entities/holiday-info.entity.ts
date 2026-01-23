import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HolidayInfoEntity {
    @PrimaryGeneratedColumn('uuid')
    holidayId: string;

    @Column()
    holidayName: string;

    @Column()
    holidayDate: string;
}
