import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateHolidayInfoCommand } from './create-holiday-info.command';
import { ICreateHolidayInfoResponse } from '../../../interfaces/response/create-holiday-info-response.interface';
import { HolidayInfo } from '../../../../../domain/holiday-info/holiday-info.entity';

/**
 * 휴일 정보 생성 Handler
 */
@CommandHandler(CreateHolidayInfoCommand)
export class CreateHolidayInfoHandler implements ICommandHandler<CreateHolidayInfoCommand, ICreateHolidayInfoResponse> {
    private readonly logger = new Logger(CreateHolidayInfoHandler.name);

    constructor(private readonly dataSource: DataSource) {}

    async execute(command: CreateHolidayInfoCommand): Promise<ICreateHolidayInfoResponse> {
        const { holidayName, holidayDate, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`휴일 정보 생성 시작: holidayName=${holidayName}, holidayDate=${holidayDate}`);

                const holidayInfoEntity = new HolidayInfo(holidayName, holidayDate);
                holidayInfoEntity.생성자설정한다(performedBy);
                holidayInfoEntity.메타데이터업데이트한다(performedBy);
                const saved = await manager.save(holidayInfoEntity);
                const holidayInfo = saved.DTO변환한다();

                this.logger.log(`휴일 정보 생성 완료: holidayInfoId=${holidayInfo.id}`);

                return {
                    holidayInfo,
                };
            } catch (error) {
                this.logger.error(`휴일 정보 생성 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
}
