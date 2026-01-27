import { IQuery } from '@nestjs/cqrs';
import { IGetDepartmentMonthlyAverageWorkHoursQuery } from '../../interfaces';

/**
 * 부서별 월별 일평균 근무시간 조회 쿼리
 */
export class GetDepartmentMonthlyAverageWorkHoursQuery implements IQuery {
    constructor(public readonly data: IGetDepartmentMonthlyAverageWorkHoursQuery) {}
}
