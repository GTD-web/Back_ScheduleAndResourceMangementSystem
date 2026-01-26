/**
 * 일간 요약 변경 이력 관련 타입 정의
 */

/**
 * 일간 요약 변경 이력 생성 데이터
 */
export interface CreateDailySummaryChangeHistoryData {
    dailyEventSummaryId: string;
    date: string;
    content: string;
    changedBy: string;
    reason?: string;
    snapshotId?: string;
}

/**
 * 일간 요약 변경 이력 업데이트 데이터
 */
export interface UpdateDailySummaryChangeHistoryData {
    content?: string;
    reason?: string;
    snapshotId?: string;
}

/**
 * 일간 요약 변경 이력 DTO
 */
export interface DailySummaryChangeHistoryDTO {
    id: string;
    dailyEventSummaryId: string;
    date: string;
    content: string;
    changedBy: string;
    changedAt: Date;
    reason: string | null;
    snapshotId: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}

