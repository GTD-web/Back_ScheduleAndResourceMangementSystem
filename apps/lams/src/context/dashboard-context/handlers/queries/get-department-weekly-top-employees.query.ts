import { IQuery } from '@nestjs/cqrs';
import { IGetDepartmentWeeklyTopEmployeesQuery } from '../../interfaces';

/**
 * 부서별 월별 주차별 주간근무시간 상위 5명 조회 쿼리
 */
export class GetDepartmentWeeklyTopEmployeesQuery implements IQuery {
    constructor(public readonly data: IGetDepartmentWeeklyTopEmployeesQuery) {}
}
