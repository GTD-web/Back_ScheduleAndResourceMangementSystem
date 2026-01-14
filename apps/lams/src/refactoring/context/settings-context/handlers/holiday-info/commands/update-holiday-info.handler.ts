import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateHolidayInfoCommand } from './update-holiday-info.command';
import { IUpdateHolidayInfoResponse } from '../../../interfaces/response/update-holiday-info-response.interface';
import { DomainHolidayInfoService } from '../../../../../domain/holiday-info/holiday-info.service';

/**
 * 휴일 정보 수정 Handler
 */
@CommandHandler(UpdateHolidayInfoCommand)
export class UpdateHolidayInfoHandler
    implements ICommandHandler<UpdateHolidayInfoCommand, IUpdateHolidayInfoResponse>
{
    private readonly logger = new Logger(UpdateHolidayInfoHandler.name);

    constructor(
        private readonly holidayInfoService: DomainHolidayInfoService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(command: UpdateHolidayInfoCommand): Promise<IUpdateHolidayInfoResponse> {
        const { id, holidayName, holidayDate, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`휴일 정보 수정 시작: id=${id}`);

                const holidayInfo = await this.holidayInfoService.수정한다(
                    id,
                    {
                        holidayName,
                        holidayDate,
                    },
                    performedBy,
                    manager,
                );

                this.logger.log(`휴일 정보 수정 완료: holidayInfoId=${holidayInfo.id}`);

                return {
                    holidayInfo,
                };
            } catch (error) {
                this.logger.error(`휴일 정보 수정 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
}
