import { WageCalculationTypeDTO } from '../../../../domain/wage-calculation-type/wage-calculation-type.types';

/**
 * 임금 계산 유형 목록 조회 응답 인터페이스
 */
export interface IGetWageCalculationTypeListResponse {
    wageCalculationTypes: WageCalculationTypeDTO[];
    totalCount: number;
}
