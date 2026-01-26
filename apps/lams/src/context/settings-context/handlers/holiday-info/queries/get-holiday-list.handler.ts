import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetHolidayListQuery } from './get-holiday-list.query';
import { IGetHolidayListResponse } from '../../../interfaces/response/get-holiday-list-response.interface';
import { DomainHolidayInfoService } from '../../../../../domain/holiday-info/holiday-info.service';

/**
 * 휴일 목록 조회 Query Handler
 */
@QueryHandler(GetHolidayListQuery)
export class GetHolidayListHandler implements IQueryHandler<GetHolidayListQuery, IGetHolidayListResponse> {
    private readonly logger = new Logger(GetHolidayListHandler.name);

    constructor(
        private readonly holidayInfoService: DomainHolidayInfoService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(query: GetHolidayListQuery): Promise<IGetHolidayListResponse> {
        this.logger.log('휴일 목록 조회 시작');

        const holidays = await this.holidayInfoService.목록조회한다();

        this.logger.log(`휴일 목록 조회 완료: totalCount=${holidays.length}`);

        return {
            holidays,
            totalCount: holidays.length,
        };
    }
}
