import { ExtractEventInfoType } from '../../../common/types/excel.type';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('event_info')
@Index(['employeeNumber', 'yyyymmdd'])
@Index(['employeeNumber', 'eventTime'], { unique: true })
export class EventInfo {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({
        description: '이벤트 아이디',
        example: 'exEventId',
    })
    eventId: string;

    @Column()
    employeeName: string;

    @Column({
        nullable: true,
    })
    @Index()
    employeeNumber: string;

    @Column()
    @Index()
    eventTime: string;

    @Column()
    yyyymmdd: string;

    @Column()
    hhmmss: string;

    static fromEventInfo(eventInfo: any): EventInfo {
        const entity = new EventInfo();
        // entity.eventId = uuidv4(); // UUID 명시적 생성

        for (const key in eventInfo) {
            if (eventInfo[key]) {
                entity[key] = eventInfo[key];
            }
        }

        return entity;
    }

    static fromEventInfoArray(eventInfoArray: ExtractEventInfoType[]): Partial<EventInfo>[] {
        return eventInfoArray.map((eventInfo) => {
            const partialEntity: Partial<EventInfo> = {};
            for (const key in eventInfo) {
                if (eventInfo[key]) {
                    partialEntity[key] = eventInfo[key];
                }
            }
            return partialEntity;
        });
    }
}
