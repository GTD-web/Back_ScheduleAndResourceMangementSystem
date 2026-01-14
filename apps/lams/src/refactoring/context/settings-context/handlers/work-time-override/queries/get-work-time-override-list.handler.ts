import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetWorkTimeOverrideListQuery } from './get-work-time-override-list.query';
import { IGetWorkTimeOverrideListResponse } from '../../../interfaces/response/get-work-time-override-list-response.interface';
import { DomainWorkTimeOverrideService } from '../../../../../domain/work-time-override/work-time-override.service';

/**
 * 특별근태시간 목록 조회 Query Handler
 */
@QueryHandler(GetWorkTimeOverrideListQuery)
export class GetWorkTimeOverrideListHandler
    implements IQueryHandler<GetWorkTimeOverrideListQuery, IGetWorkTimeOverrideListResponse>
{
    private readonly logger = new Logger(GetWorkTimeOverrideListHandler.name);

    constructor(
        private readonly workTimeOverrideService: DomainWorkTimeOverrideService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(query: GetWorkTimeOverrideListQuery): Promise<IGetWorkTimeOverrideListResponse> {
        this.logger.log('특별근태시간 목록 조회 시작');

        const workTimeOverrides = await this.workTimeOverrideService.목록조회한다();

        this.logger.log(`특별근태시간 목록 조회 완료: totalCount=${workTimeOverrides.length}`);

        return {
            workTimeOverrides,
            totalCount: workTimeOverrides.length,
        };
    }
}
