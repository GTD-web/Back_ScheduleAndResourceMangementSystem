import { Injectable, Logger } from '@nestjs/common';
import { DomainMonthlyEventSummaryViewRepository } from './monthly-event-summary-view.repository';
import { MonthlyEventSummaryView } from './monthly-event-summary-view.entity';

@Injectable()
export class DomainMonthlyEventSummaryViewService {
    private readonly logger = new Logger(DomainMonthlyEventSummaryViewService.name);

    constructor(private readonly viewRepository: DomainMonthlyEventSummaryViewRepository) {}

    /**
     * 월간 요약 뷰 조회 (단순 조회만 수행)
     */
    async findOneByEmployeeIdAndYearMonth(employeeId: string, yyyymm: string) {
        return this.viewRepository.findOneByEmployeeIdAndYearMonth(employeeId, yyyymm);
    }

    /**
     * 특정 연월의 모든 월간 요약 조회 (VIEW)
     */
    async findByYearMonth(yyyymm: string): Promise<MonthlyEventSummaryView[]> {
        return this.viewRepository.findByYearMonth(yyyymm);
    }

    /**
     * 특정 직원의 모든 월간 요약 뷰 조회
     */
    async findByEmployeeId(employeeId: string): Promise<MonthlyEventSummaryView[]> {
        return this.viewRepository.findByEmployeeId(employeeId);
    }

    /**
     * 연월 범위로 조회
     */
    async findByYearMonthRange(startYyyymm: string, endYyyymm: string): Promise<MonthlyEventSummaryView[]> {
        return this.viewRepository.findByYearMonthRange(startYyyymm, endYyyymm);
    }
}
