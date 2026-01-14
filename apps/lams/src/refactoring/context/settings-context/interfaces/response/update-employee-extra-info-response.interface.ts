import { EmployeeExtraInfoDTO } from '../../../../domain/employee-extra-info/employee-extra-info.types';

/**
 * 직원 추가 정보 변경 응답 인터페이스
 */
export interface IUpdateEmployeeExtraInfoResponse {
    extraInfo: EmployeeExtraInfoDTO;
}
