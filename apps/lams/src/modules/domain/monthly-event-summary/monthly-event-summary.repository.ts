import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MonthlyEventSummary } from './monthly-event-summary.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DomainMonthlyEventSummaryRepository extends BaseRepository<MonthlyEventSummary> {
    constructor(
        @InjectRepository(MonthlyEventSummary)
        repository: Repository<MonthlyEventSummary>,
    ) {
        super(repository);
    }

    /**
     * 특정 연월의 월간 요약 조회
     */
    async findByYearMonth(yyyymm: string): Promise<MonthlyEventSummary[]> {
        return this.repository.find({
            where: { yyyymm },
            order: { employeeNumber: 'ASC' },
        });
    }

    /**
     * 특정 직원의 월간 요약 조회
     */
    async findByEmployeeId(employeeId: string): Promise<MonthlyEventSummary[]> {
        return this.repository.find({
            where: { employeeId },
            order: { yyyymm: 'DESC' },
        });
    }

    /**
     * 특정 직원의 특정 연월 요약 조회
     */
    async findOneByEmployeeIdAndYearMonth(employeeId: string, yyyymm: string): Promise<MonthlyEventSummary | null> {
        return this.findOne({
            where: { employeeId, yyyymm },
        });
    }

    /**
     * 연월 범위로 조회
     */
    async findByYearMonthRange(startYyyymm: string, endYyyymm: string): Promise<MonthlyEventSummary[]> {
        return this.repository
            .createQueryBuilder('summary')
            .where('summary.yyyymm BETWEEN :start AND :end', {
                start: startYyyymm,
                end: endYyyymm,
            })
            .orderBy('summary.yyyymm', 'DESC')
            .addOrderBy('summary.employeeNumber', 'ASC')
            .getMany();
    }
}
