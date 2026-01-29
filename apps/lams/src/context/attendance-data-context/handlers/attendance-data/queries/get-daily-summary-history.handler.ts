import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { GetDailySummaryHistoryQuery } from './get-daily-summary-history.query';
import {
    IGetDailySummaryHistoryResponse,
    IEmployeeInfoForHistory,
    IDailySummaryHistoryItem,
} from '../../../interfaces/response/get-daily-summary-history-response.interface';
import { DomainDailyEventSummaryService } from '../../../../../domain/daily-event-summary/daily-event-summary.service';
import { DomainDailySummaryChangeHistoryService } from '../../../../../domain/daily-summary-change-history/daily-summary-change-history.service';
import { DomainEmployeeService } from '@libs/modules/employee/employee.service';
import { Employee } from '@libs/modules/employee/employee.entity';

/**
 * 일간 요약 수정이력 조회 Query Handler
 */
@QueryHandler(GetDailySummaryHistoryQuery)
export class GetDailySummaryHistoryHandler implements IQueryHandler<
    GetDailySummaryHistoryQuery,
    IGetDailySummaryHistoryResponse
> {
    private readonly logger = new Logger(GetDailySummaryHistoryHandler.name);

    constructor(
        private readonly dailyEventSummaryService: DomainDailyEventSummaryService,
        private readonly dailySummaryChangeHistoryService: DomainDailySummaryChangeHistoryService,
        private readonly employeeService: DomainEmployeeService,
    ) {}

    async execute(query: GetDailySummaryHistoryQuery): Promise<IGetDailySummaryHistoryResponse> {
        const { dailyEventSummaryId } = query.data;

        this.logger.log(`일간 요약 수정이력 조회 시작: dailyEventSummaryId=${dailyEventSummaryId}`);

        // 1. 일간 요약 조회 (존재 여부 + 직원 정보용)
        let dailySummary;
        try {
            dailySummary = await this.dailyEventSummaryService.ID로조회한다(dailyEventSummaryId);
        } catch (error) {
            throw new NotFoundException(`일간 요약을 찾을 수 없습니다. (id: ${dailyEventSummaryId})`);
        }

        // 2. 수정이력 조회 (changedBy 등 포함)
        const histories = await this.dailySummaryChangeHistoryService.일간요약ID로목록조회한다(dailyEventSummaryId);

        // 3. 해당 일간 요약의 직원 정보 조회
        const employeeInfo = await this.직원정보를조회한다(dailySummary.employeeId ?? null);

        // 4. 변경한 사람(changedBy) ID 목록 수집 후 직원 정보 일괄 조회
        const changedByIds = [...new Set(histories.map((h) => h.changedBy).filter(Boolean))] as string[];
        const changedByUserMap = await this.직원목록을ID로조회한다(changedByIds);

        // 5. 이력 항목에 employeeInfo, changerInfo 매핑 (간단한 employeeId, name만)
        const historiesWithUser: IDailySummaryHistoryItem[] = histories.map((h) => {
            const changer = h.changedBy ? changedByUserMap.get(h.changedBy) : null;
            return {
                ...h,
                employeeInfo: employeeInfo ? { employeeId: employeeInfo.id, name: employeeInfo.name } : null,
                changerInfo: changer ? { employeeId: changer.id, name: changer.name } : null,
            };
        });

        this.logger.log(`일간 요약 수정이력 조회 완료: dailyEventSummaryId=${dailyEventSummaryId}, count=${historiesWithUser.length}`);

        return {
            dailyEventSummaryId,
            histories: historiesWithUser,
            total: historiesWithUser.length,
        };
    }

    /**
     * 직원 ID로 직원 정보를 조회한다 (없으면 null)
     */
    private async 직원정보를조회한다(employeeId: string | null): Promise<Employee | null> {
        if (!employeeId) return null;
        return this.employeeService.findOne(employeeId);
    }

    /**
     * 직원 ID 목록으로 직원 정보를 조회하여 Map<id, IEmployeeInfoForHistory>으로 반환한다
     */
    private async 직원목록을ID로조회한다(ids: string[]): Promise<Map<string, IEmployeeInfoForHistory>> {
        const map = new Map<string, IEmployeeInfoForHistory>();
        await Promise.all(
            ids.map(async (id) => {
                const employee = await this.employeeService.findOne(id);
                if (employee) map.set(id, this.직원엔티티를응답형으로변환한다(employee));
            }),
        );
        return map;
    }

    private 직원엔티티를응답형으로변환한다(employee: Employee): IEmployeeInfoForHistory {
        return {
            id: employee.id,
            employeeNumber: employee.employeeNumber,
            name: employee.name,
            email: employee.email ?? null,
            status: employee.status,
        };
    }
}
