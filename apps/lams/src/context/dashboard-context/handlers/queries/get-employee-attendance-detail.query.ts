import { IQuery } from '@nestjs/cqrs';
import { IGetEmployeeAttendanceDetailQuery } from '../../interfaces';

/**
 * 연도, 월별 직원 근태상세 조회 쿼리
 */
export class GetEmployeeAttendanceDetailQuery implements IQuery {
    constructor(public readonly data: IGetEmployeeAttendanceDetailQuery) {}
}
