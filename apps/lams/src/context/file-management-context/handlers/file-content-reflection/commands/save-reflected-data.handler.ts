import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SaveReflectedDataCommand } from './save-reflected-data.command';
import { EventInfo } from '../../../../../domain/event-info/event-info.entity';
import { UsedAttendance } from '../../../../../domain/used-attendance/used-attendance.entity';

/**
 * 반영 데이터 저장 핸들러
 *
 * 파일 내용 반영으로 가공된 이벤트 정보와 근태 사용 내역을 저장합니다.
 */
@CommandHandler(SaveReflectedDataCommand)
export class SaveReflectedDataHandler implements ICommandHandler<SaveReflectedDataCommand, void> {
    private readonly logger = new Logger(SaveReflectedDataHandler.name);

    constructor(private readonly dataSource: DataSource) {}

    async execute(command: SaveReflectedDataCommand): Promise<void> {
        const { eventInfos, usedAttendances } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            await this.반영데이터를저장한다(eventInfos, usedAttendances, manager);
        });
    }

    /**
     * 반영 데이터를 저장한다
     */
    private async 반영데이터를저장한다(
        eventInfos: Partial<EventInfo>[],
        usedAttendances: Partial<UsedAttendance>[],
        manager: any,
    ): Promise<void> {
        // 1. 이벤트 정보 저장
        if (eventInfos.length > 0) {
            const EVENT_BATCH_SIZE = 10000;
            for (let i = 0; i < eventInfos.length; i += EVENT_BATCH_SIZE) {
                const batch = eventInfos.slice(i, i + EVENT_BATCH_SIZE);
                await manager.createQueryBuilder().insert().into(EventInfo).values(batch).execute();
            }
            this.logger.log(`이벤트 정보 저장 완료: ${eventInfos.length}건`);
        }

        // 2. 근태 사용 내역 저장
        if (usedAttendances.length > 0) {
            const ATTENDANCE_BATCH_SIZE = 1000;
            for (let i = 0; i < usedAttendances.length; i += ATTENDANCE_BATCH_SIZE) {
                const batch = usedAttendances.slice(i, i + ATTENDANCE_BATCH_SIZE);
                await manager.createQueryBuilder().insert().into(UsedAttendance).values(batch).execute();
            }
            this.logger.log(`근태 사용 내역 저장 완료: ${usedAttendances.length}건`);
        }
    }
}
