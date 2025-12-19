import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentEmployee } from '../../../libs/entities/department-employee.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';
import { DepartmentEmployeeCreateRequestDto, DepartmentEmployeeUpdateRequestDto } from './dtos';

@Injectable()
export class DomainDepartmentEmployeeRepository extends BaseRepository<DepartmentEmployee> {
    constructor(
        @InjectRepository(DepartmentEmployee)
        private readonly departmentEmployeeRepository: Repository<DepartmentEmployee>,
    ) {
        super(departmentEmployeeRepository);
    }
}
