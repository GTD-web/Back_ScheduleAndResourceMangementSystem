import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileMaintenance } from './file-maintenance.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainFileMaintenanceRepository extends BaseRepository<FileMaintenance> {
    constructor(
        @InjectRepository(FileMaintenance)
        repository: Repository<FileMaintenance>,
    ) {
        super(repository);
    }
}
