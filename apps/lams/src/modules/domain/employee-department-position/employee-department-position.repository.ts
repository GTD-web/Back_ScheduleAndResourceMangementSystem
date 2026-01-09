import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeDepartmentPosition } from './employee-department-position.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class DomainEmployeeDepartmentPositionRepository extends BaseRepository<EmployeeDepartmentPosition> {
    constructor(
        @InjectRepository(EmployeeDepartmentPosition)
        repository: Repository<EmployeeDepartmentPosition>,
    ) {
        super(repository);
    }
}
