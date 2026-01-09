import { Injectable } from '@nestjs/common';
import { DomainEmployeeDepartmentPositionRepository } from './employee-department-position.repository';
import { BaseService } from '../../../common/services/base.service';
import { EmployeeDepartmentPosition } from './employee-department-position.entity';

@Injectable()
export class DomainEmployeeDepartmentPositionService extends BaseService<EmployeeDepartmentPosition> {
    constructor(private readonly employeeDepartmentPositionRepository: DomainEmployeeDepartmentPositionRepository) {
        super(employeeDepartmentPositionRepository);
    }
}
