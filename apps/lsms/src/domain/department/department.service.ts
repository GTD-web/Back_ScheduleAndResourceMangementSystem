import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DomainDepartmentRepository } from './department.repository';
import { DepartmentMicroserviceAdapter } from './adapters';
import { BaseService } from '../../../libs/services/base.service';
import {
    DepartmentCreateRequestDto,
    DepartmentUpdateRequestDto,
    DepartmentResponseDto,
    DepartmentHierarchyResponseDto,
} from './dtos';
import { Department } from './department.entity';

@Injectable()
export class DomainDepartmentService extends BaseService<Department> {
    private readonly logger = new Logger(DomainDepartmentService.name);

    constructor(
        private readonly departmentRepository: DomainDepartmentRepository,
        private readonly departmentAdapter: DepartmentMicroserviceAdapter,
    ) {
        super(departmentRepository);
    }
}
