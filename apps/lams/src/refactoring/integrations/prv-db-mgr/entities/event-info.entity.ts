import { ExtractEventInfoType } from '../types/excel.type';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('event_info_entity')
@Index(['employeeNumber', 'yyyymmdd'])
export class EventInfoEntity {
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

    static fromEventInfo(eventInfo: any): EventInfoEntity {
        const entity = new EventInfoEntity();
        entity.eventId = uuidv4(); // UUID 명시적 생성

        for (const key in eventInfo) {
            if (eventInfo[key]) {
                entity[key] = eventInfo[key];
            }
        }

        return entity;
    }

    static fromEventInfoArray(eventInfoArray: ExtractEventInfoType[]): Partial<EventInfoEntity>[] {
        return eventInfoArray.map((eventInfo) => {
            const partialEntity: Partial<EventInfoEntity> = { eventId: uuidv4() };
            for (const key in eventInfo) {
                if (eventInfo[key]) {
                    partialEntity[key] = eventInfo[key];
                }
            }
            return partialEntity;
        });
    }
}
