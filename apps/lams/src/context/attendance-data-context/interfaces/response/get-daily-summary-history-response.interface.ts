import { DailySummaryChangeHistoryDTO } from '../../../../domain/daily-summary-change-history/daily-summary-change-history.types';

/**
 * 일간 요약 수정이력 조회 시 노출하는 직원 정보 (해당 요약의 직원 / 변경한 사람)
 */
export interface IEmployeeInfoForHistory {
    id: string;
    employeeNumber: string;
    name: string;
    email: string | null;
    status: string;
}

/** 일간 요약/변경 이력에 노출하는 간단한 직원 정보 */
export interface IEmployeeSummaryForHistory {
    employeeId: string;
    name: string;
}

/**
 * 변경 이력 항목 (일간 요약 대상 직원 정보 + 변경한 사람 정보 포함)
 */
export interface IDailySummaryHistoryItem extends DailySummaryChangeHistoryDTO {
    /** 일간 요약 대상 직원 (employeeId, name) */
    employeeInfo: IEmployeeSummaryForHistory | null;
    /** 변경한 사람 (employeeId, name) */
    changerInfo: IEmployeeSummaryForHistory | null;
}

/**
 * 일간 요약 수정이력 조회 Response 인터페이스
 */
export interface IGetDailySummaryHistoryResponse {
    dailyEventSummaryId: string;
    /** 해당 일간 요약의 직원 정보 (DailyEventSummary.employee_id로 조회) */
    /** 변경 이력 목록 (changedByUser 포함) */
    histories: IDailySummaryHistoryItem[];
    total: number;
}
