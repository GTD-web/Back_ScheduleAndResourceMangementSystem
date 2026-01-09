import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MonthlyEventSummaryView } from './monthly-event-summary-view.entity';

@Injectable()
export class DomainMonthlyEventSummaryViewRepository extends Repository<MonthlyEventSummaryView> {
    constructor(private dataSource: DataSource) {
        super(MonthlyEventSummaryView, dataSource.createEntityManager());
    }

    /**
     * 특정 연월의 월간 요약 뷰 조회
     */
    async findByYearMonth(yyyymm: string): Promise<MonthlyEventSummaryView[]> {
        return this.find({
            where: { yyyymm },
        });
    }

    /**
     * 특정 직원의 월간 요약 뷰 조회
     */
    async findByEmployeeId(employeeId: string): Promise<MonthlyEventSummaryView[]> {
        return this.createQueryBuilder('view')
            .where('view.employeeId = :employeeId', { employeeId })
            .orderBy('view.yyyymm', 'DESC')
            .getMany();
    }

    /**
     * 특정 직원의 특정 연월 요약 뷰 조회
     */
    async findOneByEmployeeIdAndYearMonth(employeeId: string, yyyymm: string): Promise<MonthlyEventSummaryView | null> {
        return this.findOne({
            where: { employeeId, yyyymm },
        });
    }

    /**
     * 연월 범위로 조회
     */
    async findByYearMonthRange(startYyyymm: string, endYyyymm: string): Promise<MonthlyEventSummaryView[]> {
        return this.createQueryBuilder('view')
            .where('view.yyyymm BETWEEN :start AND :end', {
                start: startYyyymm,
                end: endYyyymm,
            })
            .orderBy('view.yyyymm', 'DESC')
            .addOrderBy('view.employeeNumber', 'ASC')
            .getMany();
    }
}
