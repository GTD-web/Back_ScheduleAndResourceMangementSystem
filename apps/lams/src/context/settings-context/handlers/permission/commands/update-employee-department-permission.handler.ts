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
 * 권한이 없으면 생성하고, 있으면 업데이트합니다.
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
        const { employeeId, departmentId, hasAccessPermission, hasReviewPermission, performedBy } = command.data;

        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(
                    `직원-부서 권한 변경 시작: employeeId=${employeeId}, departmentId=${departmentId}, hasAccessPermission=${hasAccessPermission}, hasReviewPermission=${hasReviewPermission}`,
                );

                // 기존 권한 조회
                const existingPermission = await this.permissionService.직원과부서로조회한다(
                    employeeId,
                    departmentId,
                    manager,
                );

                let permission;

                if (existingPermission) {
                    // 기존 권한이 있으면 업데이트
                    permission = await this.permissionService.수정한다(
                        existingPermission.id,
                        {
                            hasAccessPermission,
                            hasReviewPermission,
                        },
                        performedBy,
                        manager,
                    );
                } else {
                    // 기존 권한이 없으면 생성
                    permission = await this.permissionService.생성한다(
                        {
                            employeeId,
                            departmentId,
                            hasAccessPermission,
                            hasReviewPermission,
                        },
                        manager,
                    );
                }

                this.logger.log(`직원-부서 권한 변경 완료: permissionId=${permission.id}`);

                return {
                    permission,
                };
            } catch (error) {
                this.logger.error(`직원-부서 권한 변경 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
}
