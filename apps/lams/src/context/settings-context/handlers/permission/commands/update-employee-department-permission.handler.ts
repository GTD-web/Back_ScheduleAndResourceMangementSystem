import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateEmployeeDepartmentPermissionCommand } from './update-employee-department-permission.command';
import { IUpdateEmployeeDepartmentPermissionResponse } from '../../../interfaces/response/update-employee-department-permission-response.interface';
import { DomainEmployeeDepartmentPermissionService } from '../../../../../domain/employee-department-permission/employee-department-permission.service';

/**
 * 직원-부서 권한 변경 Handler
 *
 * 직원의 부서에 대한 접근권한과 검토권한을 변경합니다.
 * 해당 직원의 모든 권한을 삭제한 후 요청된 부서 권한들을 재생성합니다.
 */
@CommandHandler(UpdateEmployeeDepartmentPermissionCommand)
export class UpdateEmployeeDepartmentPermissionHandler implements ICommandHandler<
    UpdateEmployeeDepartmentPermissionCommand,
    IUpdateEmployeeDepartmentPermissionResponse
> {
    private readonly logger = new Logger(UpdateEmployeeDepartmentPermissionHandler.name);

    constructor(
        private readonly permissionService: DomainEmployeeDepartmentPermissionService,
        private readonly dataSource: DataSource,
    ) {}

    async execute(
        command: UpdateEmployeeDepartmentPermissionCommand,
    ): Promise<IUpdateEmployeeDepartmentPermissionResponse> {
        const { employeeId, departments, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(
                    `직원-부서 권한 변경 시작: employeeId=${employeeId}, departments=${departments.length}개`,
                );

                // 해당 직원의 모든 기존 권한 일괄 삭제 (Hard Delete)
                await this.permissionService.직원으로일괄삭제한다(employeeId, manager);

                this.logger.log(`기존 권한 일괄 삭제 완료`);

                // 요청된 부서 권한들 재생성
                const createdPermissions = [];
                for (const department of departments) {
                    const permission = await this.permissionService.생성한다(
                        {
                            employeeId,
                            departmentId: department.departmentId,
                            hasAccessPermission: department.hasAccessPermission,
                            hasReviewPermission: department.hasReviewPermission,
                        },
                        manager,
                    );
                    createdPermissions.push(permission);
                }

                this.logger.log(`직원-부서 권한 변경 완료: ${createdPermissions.length}개 권한 생성`);

                return {
                    permissions: createdPermissions,
                };
            } catch (error) {
                this.logger.error(`직원-부서 권한 변경 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
}
