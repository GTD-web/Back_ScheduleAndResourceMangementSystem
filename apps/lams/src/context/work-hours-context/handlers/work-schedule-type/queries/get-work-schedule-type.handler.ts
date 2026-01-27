import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetWorkScheduleTypeQuery } from './get-work-schedule-type.query';
import { IGetWorkScheduleTypeResponse } from '../../../interfaces/response/get-work-schedule-type-response.interface';
import { DomainWorkScheduleTypeService } from '../../../../../domain/work-schedule-type/work-schedule-type.service';

/**
 * 근무 유형 조회 Query Handler
 */
@QueryHandler(GetWorkScheduleTypeQuery)
export class GetWorkScheduleTypeHandler
    implements IQueryHandler<GetWorkScheduleTypeQuery, IGetWorkScheduleTypeResponse>
{
    private readonly logger = new Logger(GetWorkScheduleTypeHandler.name);

    constructor(private readonly workScheduleTypeService: DomainWorkScheduleTypeService) {}

    async execute(query: GetWorkScheduleTypeQuery): Promise<IGetWorkScheduleTypeResponse> {
        const { date } = query.data;

        this.logger.log(`근무 유형 조회 시작: date=${date || '오늘'}`);

        const targetDate = date || new Date().toISOString().split('T')[0];
        const scheduleType = await this.workScheduleTypeService.날짜로조회한다(targetDate);

        this.logger.log(`근무 유형 조회 완료: scheduleType=${scheduleType?.scheduleType || 'null'}`);

        return {
            scheduleType,
        };
    }
}
