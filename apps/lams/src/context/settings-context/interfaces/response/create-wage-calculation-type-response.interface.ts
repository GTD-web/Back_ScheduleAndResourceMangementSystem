import { WageCalculationTypeDTO } from '../../../../domain/wage-calculation-type/wage-calculation-type.types';

/**
 * 임금 계산 유형 생성 응답 인터페이스
 */
export interface ICreateWageCalculationTypeResponse {
    wageCalculationType: WageCalculationTypeDTO;
}
