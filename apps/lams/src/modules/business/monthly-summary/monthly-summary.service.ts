import { Injectable, Logger } from '@nestjs/common';
import { MonthlySummaryContext } from '../../context/monthly-summary/monthly-summary.context';
import { DomainEmployeeDepartmentPositionService } from '../../domain/employee-department-position/employee-department-position.service';
import { DomainMonthlyEventSummaryService } from '../../domain/monthly-event-summary/monthly-event-summary.service';

/**
 * 월간 요약 비즈니스 서비스
 *
 * 컨트롤러와 컨텍스트 사이의 비즈니스 로직을 담당합니다.
 */
@Injectable()
export class MonthlySummaryService {
    private readonly logger = new Logger(MonthlySummaryService.name);

    constructor(
        private readonly monthlySummaryContext: MonthlySummaryContext,
        private readonly employeeDepartmentPositionService: DomainEmployeeDepartmentPositionService,
        private readonly monthlySummaryService: DomainMonthlyEventSummaryService,
    ) {}

    /**
     * 특정 연월의 모든 월간 요약 조회 또는 생성 (전 직원 대상)
     * @param yyyymm - 연월 (YYYY-MM)
     * @param departmentId - 부서 ID (선택)
     * @returns 월간 요약 목록 (부서 필터링 적용 시 해당 부서 직원만)
     */
    async generateMonthlySummariesForAllEmployees(yyyymm: string, departmentId?: string) {
        this.logger.log(`월간 요약 조회 시작: ${yyyymm}`);

        // 1. 기존 월간 요약 조회
        let allSummaries = await this.monthlySummaryService.findByYearMonth(yyyymm);

        // 2. 데이터가 없으면 생성
        if (allSummaries.length === 0) {
            this.logger.log(`${yyyymm} 월간 요약이 존재하지 않습니다. 새로 생성합니다.`);
            allSummaries = await this.monthlySummaryContext.generateMonthlySummariesForAllEmployees(yyyymm);
        } else {
            this.logger.log(`${yyyymm} 월간 요약 ${allSummaries.length}건 조회 완료`);
        }

        // 3. 부서 필터링이 없으면 전체 반환
        if (!departmentId) {
            return allSummaries;
        }

        // 4. 부서 필터링 적용
        this.logger.log(`부서 ID ${departmentId}로 월간 요약 필터링 시작`);

        // 해당 부서의 직원 ID 목록 조회
        const departmentPositions = await this.employeeDepartmentPositionService.findAll({
            where: { departmentId },
        });

        const employeeIdsInDepartment = new Set(departmentPositions.map((dp) => dp.employeeId));

        this.logger.log(`부서에 속한 직원 ${employeeIdsInDepartment.size}명 조회 완료`);

        // 해당 부서의 직원들만 필터링
        const filteredSummaries = allSummaries.filter((summary) => employeeIdsInDepartment.has(summary.employeeId));

        this.logger.log(`부서 필터링 완료: 전체 ${allSummaries.length}명 중 ${filteredSummaries.length}명의 요약 반환`);

        return filteredSummaries;
    }
}
