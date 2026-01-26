import { ICommand } from '@nestjs/cqrs';
import { IUpdateEmployeeDepartmentPermissionCommand } from '../../../interfaces/command/update-employee-department-permission-command.interface';

/**
 * 직원-부서 권한 변경 Command
 */
export class UpdateEmployeeDepartmentPermissionCommand implements ICommand {
    constructor(public readonly data: IUpdateEmployeeDepartmentPermissionCommand) {}
}
