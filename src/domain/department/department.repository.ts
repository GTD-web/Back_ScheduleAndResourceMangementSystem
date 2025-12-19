import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Department } from '../../../libs/entities/department.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';
import { DepartmentCreateRequestDto, DepartmentUpdateRequestDto } from './dtos';

@Injectable()
export class DomainDepartmentRepository extends BaseRepository<Department> {
    constructor(
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
    ) {
        super(departmentRepository);
    }
}
