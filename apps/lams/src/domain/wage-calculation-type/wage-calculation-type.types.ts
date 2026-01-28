/**
 * 임금 계산 유형 관련 타입 정의
 */

/**
 * 임금 계산 유형
 */
export enum CalculationType {
    REGULAR_WAGE = 'REGULAR_WAGE', // 통상임금제
    COMPREHENSIVE_WAGE = 'COMPREHENSIVE_WAGE', // 포괄임금제
}

/**
 * 임금 계산 유형 생성 데이터
 */
export interface CreateWageCalculationTypeData {
    calculationType: CalculationType;
    startDate: string; // yyyy-MM-dd 형식
    changedAt?: Date; // 변경일시
    isCurrentlyApplied?: boolean; // 현재적용중여부
}

/**
 * 임금 계산 유형 업데이트 데이터
 */
export interface UpdateWageCalculationTypeData {
    calculationType?: CalculationType;
    startDate?: string; // yyyy-MM-dd 형식
    changedAt?: Date; // 변경일시
    isCurrentlyApplied?: boolean; // 현재적용중여부
}

/**
 * 임금 계산 유형 DTO
 */
export interface WageCalculationTypeDTO {
    id: string;
    calculationType: CalculationType;
    startDate: string;
    changedAt: Date;
    isCurrentlyApplied: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    version: number;
}
