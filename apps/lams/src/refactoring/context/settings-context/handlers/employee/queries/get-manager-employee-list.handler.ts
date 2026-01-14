import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetManagerEmployeeListQuery } from './get-manager-employee-list.query';
import { IGetManagerEmployeeListResponse, IEmployeeInfo } from '../../../interfaces/response/get-manager-employee-list-response.interface';
import { DomainEmployeeDepartmentPositionHistoryService } from '@libs/modules/employee-department-position-history/employee-department-position-history.service';
import { Employee } from '@libs/modules/employee/employee.entity';

/**
 * 관리자 직원 목록 조회 Query Handler
 *
 * 배치이력에서 관리자였던 적이 있는 직원들만 조회합니다.
 */
@QueryHandler(GetManagerEmployeeListQuery)
export class GetManagerEmployeeListHandler implements IQueryHandler<GetManagerEmployeeListQuery, IGetManagerEmployeeListResponse> {
    private readonly logger = new Logger(GetManagerEmployeeListHandler.name);

    constructor(
        private readonly employeeDepartmentPositionHistoryService: DomainEmployeeDepartmentPositionHistoryService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(query: GetManagerEmployeeListQuery): Promise<IGetManagerEmployeeListResponse> {
        this.logger.log('관리자 직원 목록 조회 시작');

        // 배치이력에서 관리자였던 적이 있는 직원 ID 목록 조회
        const managerHistories = await this.dataSource.manager
            .createQueryBuilder()
            .select('DISTINCT eh.employeeId', 'employeeId')
            .from('employee_department_position_history', 'eh')
            .leftJoin('employee', 'emp', 'emp.id = eh.employeeId')
            .where('eh.isManager = :isManager', { isManager: true })
            .andWhere('emp.terminationDate IS NULL')
            .getRawMany<{ employeeId: string }>();

        if (managerHistories.length === 0) {
            this.logger.warn('관리자였던 적이 있는 직원이 없습니다.');
            return { employees: [], totalCount: 0 };
        }

        const employeeIds = managerHistories.map((h) => h.employeeId);

        // 직원 상세 정보 조회
        const employees = await this.dataSource.manager
            .createQueryBuilder(Employee, 'emp')
            .where('emp.id IN (:...ids)', { ids: employeeIds })
            .andWhere('emp.terminationDate IS NULL')
            .orderBy('emp.employeeNumber', 'ASC')
            .getMany();

        const employeeList: IEmployeeInfo[] = employees.map((emp) => ({
            id: emp.id,
            employeeNumber: emp.employeeNumber,
            employeeName: emp.name,
        }));

        this.logger.log(`관리자 직원 목록 조회 완료: totalCount=${employeeList.length}`);

        return {
            employees: employeeList,
            totalCount: employeeList.length,
        };
    }
}
