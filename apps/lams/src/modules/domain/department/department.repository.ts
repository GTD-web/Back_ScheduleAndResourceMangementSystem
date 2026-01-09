import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class DomainDepartmentRepository extends BaseRepository<Department> {
    constructor(
        @InjectRepository(Department)
        repository: Repository<Department>,
    ) {
        super(repository);
    }
}
