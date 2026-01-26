import { ICommand } from '@nestjs/cqrs';
import { IUpdateEmployeeExtraInfoCommand } from '../../../interfaces/command/update-employee-extra-info-command.interface';

/**
 * 직원 추가 정보 변경 Command
 */
export class UpdateEmployeeExtraInfoCommand implements ICommand {
    constructor(public readonly data: IUpdateEmployeeExtraInfoCommand) {}
}
