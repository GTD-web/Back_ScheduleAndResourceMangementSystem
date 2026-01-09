import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('holiday_info')
export class HolidayInfo {
    @PrimaryGeneratedColumn('uuid')
    holidayId: string;

    @Column()
    holidayName: string;

    @Column()
    holidayDate: string;
}
