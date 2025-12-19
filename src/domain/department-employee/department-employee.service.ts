import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DomainDepartmentEmployeeRepository } from './department-employee.repository';
import { BaseService } from '../../../libs/services/base.service';
import {
    DepartmentEmployeeCreateRequestDto,
    DepartmentEmployeeUpdateRequestDto,
    DepartmentEmployeeResponseDto,
    DepartmentEmployeesResponseDto,
} from './dtos';
import { DepartmentEmployee } from '../../../libs/entities/department-employee.entity';

@Injectable()
export class DomainDepartmentEmployeeService extends BaseService<DepartmentEmployee> {
    private readonly logger = new Logger(DomainDepartmentEmployeeService.name);

    constructor(private readonly departmentEmployeeRepository: DomainDepartmentEmployeeRepository) {
        super(departmentEmployeeRepository);
    }
}
