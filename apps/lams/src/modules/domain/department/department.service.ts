import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainDepartmentRepository } from './department.repository';
import { BaseService } from '../../../common/services/base.service';
import { Department } from './department.entity';

@Injectable()
export class DomainDepartmentService extends BaseService<Department> {
    constructor(private readonly departmentRepository: DomainDepartmentRepository) {
        super(departmentRepository);
    }
}
