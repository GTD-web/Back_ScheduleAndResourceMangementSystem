import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetEmployeePermissionListQuery } from './get-employee-permission-list.query';
import { IGetEmployeePermissionListResponse } from '../../../interfaces/response/get-employee-permission-list-response.interface';
import { IEmployeeDepartmentPermissionInfo } from '../../../interfaces/response/employee-department-permission-info.interface';
import { Employee, EmployeeStatus } from '@libs/modules/employee/employee.entity';
import { EmployeeDepartmentPermission } from '../../../../../domain/employee-department-permission/employee-department-permission.entity';

/**
 * 직원의 권한 목록 조회 Query Handler
 *
 * 특정 직원의 부서별 권한 정보를 조회합니다.
 */
@QueryHandler(GetEmployeePermissionListQuery)
export class GetEmployeePermissionListHandler implements IQueryHandler<GetEmployeePermissionListQuery, IGetEmployeePermissionListResponse> {
    private readonly logger = new Logger(GetEmployeePermissionListHandler.name);

    constructor(
        private readonly dataSource: DataSource,
    ) {}

    async execute(query: GetEmployeePermissionListQuery): Promise<IGetEmployeePermissionListResponse> {
        const { employeeId } = query.data;

        this.logger.log(`직원의 권한 목록 조회 시작: employeeId=${employeeId}`);

        // 1. 직원 존재 여부 확인
        const employee = await this.dataSource.manager.findOne(Employee, {
            where: { id: employeeId, status: EmployeeStatus.Active },
        });

        if (!employee) {
            this.logger.warn(`직원을 찾을 수 없습니다: employeeId=${employeeId}`);
            throw new NotFoundException(`직원을 찾을 수 없습니다: ${employeeId}`);
        }

        // 2. 해당 직원의 모든 권한 조회
        const permissions = await this.dataSource.manager
            .createQueryBuilder(EmployeeDepartmentPermission, 'permission')
            .leftJoinAndSelect('permission.department', 'department')
            .where('permission.employee_id = :employeeId', { employeeId })
            .andWhere('permission.deleted_at IS NULL')
            .getMany();

        // 3. 권한 정보 변환
        const permissionInfos: IEmployeeDepartmentPermissionInfo[] = permissions.map((permission) => ({
            departmentId: permission.department_id,
            departmentName: permission.department?.departmentName || '',
            hasAccessPermission: permission.has_access_permission,
            hasReviewPermission: permission.has_review_permission,
        }));

        this.logger.log(`직원의 권한 목록 조회 완료: employeeId=${employeeId}, permissionCount=${permissionInfos.length}`);

        return {
            id: employee.id,
            employeeNumber: employee.employeeNumber,
            employeeName: employee.name,
            permissions: permissionInfos,
        };
    }
}
