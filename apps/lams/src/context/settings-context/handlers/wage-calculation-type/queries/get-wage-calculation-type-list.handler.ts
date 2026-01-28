import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetWageCalculationTypeListQuery } from './get-wage-calculation-type-list.query';
import { IGetWageCalculationTypeListResponse } from '../../../interfaces/response/get-wage-calculation-type-list-response.interface';
import { DomainWageCalculationTypeService } from '../../../../../domain/wage-calculation-type/wage-calculation-type.service';

/**
 * 임금 계산 유형 목록 조회 Query Handler
 */
@QueryHandler(GetWageCalculationTypeListQuery)
export class GetWageCalculationTypeListHandler
    implements IQueryHandler<GetWageCalculationTypeListQuery, IGetWageCalculationTypeListResponse>
{
    private readonly logger = new Logger(GetWageCalculationTypeListHandler.name);

    constructor(private readonly wageCalculationTypeService: DomainWageCalculationTypeService) {}

    async execute(query: GetWageCalculationTypeListQuery): Promise<IGetWageCalculationTypeListResponse> {
        this.logger.log('임금 계산 유형 목록 조회 시작');

        const wageCalculationTypes = await this.wageCalculationTypeService.목록조회한다();

        this.logger.log(`임금 계산 유형 목록 조회 완료: totalCount=${wageCalculationTypes.length}`);

        return {
            wageCalculationTypes,
            totalCount: wageCalculationTypes.length,
        };
    }
}
