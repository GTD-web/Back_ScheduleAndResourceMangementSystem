import { IQuery } from '@nestjs/cqrs';
import { IGetDepartmentMonthlyEmployeeAttendanceQuery } from '../../interfaces';

/**
 * 부서별 월별 직원별 근무내역 조회 쿼리
 */
export class GetDepartmentMonthlyEmployeeAttendanceQuery implements IQuery {
    constructor(public readonly data: IGetDepartmentMonthlyEmployeeAttendanceQuery) {}
}
