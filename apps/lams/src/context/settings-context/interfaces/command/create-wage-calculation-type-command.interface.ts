import { CalculationType } from '../../../../domain/wage-calculation-type/wage-calculation-type.types';

/**
 * 임금 계산 유형 생성 Command 인터페이스
 */
export interface ICreateWageCalculationTypeCommand {
    calculationType: CalculationType;
    startDate: string; // yyyy-MM-dd 형식
    changedAt?: Date;
    isCurrentlyApplied?: boolean;
    performedBy: string;
}
