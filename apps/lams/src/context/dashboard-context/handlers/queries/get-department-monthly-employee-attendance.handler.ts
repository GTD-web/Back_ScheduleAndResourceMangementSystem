import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetDepartmentMonthlyEmployeeAttendanceQuery } from './get-department-monthly-employee-attendance.query';
import { IGetDepartmentMonthlyEmployeeAttendanceResponse } from '../../interfaces';
import { DomainUsedAttendanceService } from '../../../../domain/used-attendance/used-attendance.service';
import { MonthlyEventSummary } from '../../../../domain/monthly-event-summary/monthly-event-summary.entity';
import { EmployeeDepartmentPositionHistory } from '@libs/modules/employee-department-position-history/employee-department-position-history.entity';
import { startOfMonth, endOfMonth, format } from 'date-fns';

/**
 * 부서별 월별 직원별 근무내역 조회 Query Handler
 *
 * 근태사용내역을 기준으로 출장, 연차, 결근, 지각에 대한 정보를 조회합니다.
 */
@QueryHandler(GetDepartmentMonthlyEmployeeAttendanceQuery)
export class GetDepartmentMonthlyEmployeeAttendanceHandler
    implements IQueryHandler<GetDepartmentMonthlyEmployeeAttendanceQuery, IGetDepartmentMonthlyEmployeeAttendanceResponse>
{
    private readonly logger = new Logger(GetDepartmentMonthlyEmployeeAttendanceHandler.name);

    constructor(
        private readonly usedAttendanceService: DomainUsedAttendanceService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(
        query: GetDepartmentMonthlyEmployeeAttendanceQuery,
    ): Promise<IGetDepartmentMonthlyEmployeeAttendanceResponse> {
        const { departmentId, year, month } = query.data;

        this.logger.log(
            `부서별 월별 직원별 근무내역 조회: departmentId=${departmentId}, year=${year}, month=${month}`,
        );

        // 1. 부서별 직원 목록 조회 (해당 월 1일부터 말일까지의 범위)
        const startDate = format(startOfMonth(new Date(`${year}-${month}-01`)), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(new Date(`${year}-${month}-01`)), 'yyyy-MM-dd');
        
        const employeeHistories = await this.dataSource.manager
            .createQueryBuilder('EmployeeDepartmentPositionHistory', 'eh')
            .leftJoinAndSelect('eh.employee', 'emp')
            .leftJoinAndSelect('eh.position', 'pos')
            .leftJoinAndSelect('eh.rank', 'rank')
            .where('eh.departmentId = :departmentId', { departmentId })
            .andWhere('eh.effectiveStartDate <= :endDate', { endDate })
            .andWhere('(eh.effectiveEndDate IS NULL OR eh.effectiveEndDate >= :startDate)', { startDate })
            .getMany();
        
        const employeeIds = employeeHistories.map((eh) => eh.employeeId).filter((id) => id);

        if (employeeIds.length === 0) {
            return {
                departmentId,
                year,
                month,
                employeeAttendances: [],
            };
        }

        // 2. 해당 월의 날짜 범위 (이미 위에서 계산됨)

        // 3. 근태 사용 내역 조회
        const usedAttendances = await this.usedAttendanceService.직원ID목록과날짜범위로조회한다(
            employeeIds,
            startDate,
            endDate,
        );

        // 4. 월간 요약에서 지각 정보 조회
        const yyyymm = `${year}-${month}`;
        const summaries = await this.dataSource.manager
            .createQueryBuilder(MonthlyEventSummary, 'summary')
            .leftJoinAndSelect('summary.employee', 'employee')
            .where('summary.yyyymm = :yyyymm', { yyyymm })
            .andWhere('summary.deleted_at IS NULL')
            .andWhere('summary.employee_id IN (:...employeeIds)', { employeeIds })
            .getMany();

        // 5. 직원별 근태 사용 내역 집계
        const employeeAttendanceMap = new Map<string, {
            employeeId: string;
            employeeName: string;
            employeeNumber: string;
            attendanceUsage: {
                businessTrip: number;
                annualLeave: number;
                absence: number;
                late: number;
            };
        }>();

        // 초기화
        employeeHistories.forEach((history) => {
            employeeAttendanceMap.set(history.employeeId, {
                employeeId: history.employeeId,
                employeeName: history.employeeName || '',
                employeeNumber: history.employeeNumber || '',
                attendanceUsage: {
                    businessTrip: 0,
                    annualLeave: 0,
                    absence: 0,
                    late: 0,
                },
            });
        });

        // 근태 사용 내역 집계
        usedAttendances.forEach((ua) => {
            const employeeAttendance = employeeAttendanceMap.get(ua.employeeId);
            if (!employeeAttendance) return;

            const title = ua.attendanceType?.title || '';
            if (title === '출장') {
                employeeAttendance.attendanceUsage.businessTrip++;
            } else if (title === '연차' || title === '오전반차' || title === '오후반차') {
                employeeAttendance.attendanceUsage.annualLeave++;
            }
        });

        // 월간 요약에서 지각, 결근 정보 집계
        summaries.forEach((summary) => {
            const employeeAttendance = employeeAttendanceMap.get(summary.employee_id);
            if (!employeeAttendance) return;

            const attendanceTypeCount = summary.attendance_type_count || {};
            employeeAttendance.attendanceUsage.late += attendanceTypeCount['지각'] || 0;
            employeeAttendance.attendanceUsage.absence += attendanceTypeCount['결근'] || 0;
        });

        const employeeAttendances = Array.from(employeeAttendanceMap.values());

        return {
            departmentId,
            year,
            month,
            employeeAttendances,
        };
    }
}
