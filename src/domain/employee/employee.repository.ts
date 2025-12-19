import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../../libs/entities/employee.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainEmployeeRepository extends BaseRepository<Employee> {
    constructor(
        @InjectRepository(Employee)
        repository: Repository<Employee>,
    ) {
        super(repository);
    }
}
