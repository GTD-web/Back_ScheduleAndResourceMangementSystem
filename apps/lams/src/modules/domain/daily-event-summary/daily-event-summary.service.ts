import { Injectable } from '@nestjs/common';
import { DomainDailyEventSummaryRepository } from './daily-event-summary.repository';
import { BaseService } from '../../../common/services/base.service';
import { DailyEventSummary } from './daily-event-summary.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class DomainDailyEventSummaryService extends BaseService<DailyEventSummary> {
    constructor(
        private readonly dailyEventSummaryRepository: DomainDailyEventSummaryRepository,
        private readonly dataSource: DataSource,
    ) {
        super(dailyEventSummaryRepository);
    }

    /**
     * 특정 기간 동안의 모든 일일 요약 조회 (직원 정보 포함)
     */
    async findByDateRange(startDate: string, endDate: string): Promise<DailyEventSummary[]> {
        return this.dataSource.manager
            .createQueryBuilder(DailyEventSummary, 'daily')
            .leftJoinAndSelect('daily.employee', 'employee')
            .where('daily.date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .orderBy('daily.employeeId', 'ASC')
            .addOrderBy('daily.date', 'ASC')
            .getMany();
    }

    /**
     * 특정 직원의 특정 기간 일일 요약 조회
     */
    async findByEmployeeIdAndDateRange(
        employeeId: string,
        startDate: string,
        endDate: string,
    ): Promise<DailyEventSummary[]> {
        return this.dataSource.manager
            .createQueryBuilder(DailyEventSummary, 'daily')
            .leftJoinAndSelect('daily.employee', 'employee')
            .where('daily.employeeId = :employeeId', { employeeId })
            .andWhere('daily.date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .orderBy('daily.date', 'ASC')
            .getMany();
    }
}
