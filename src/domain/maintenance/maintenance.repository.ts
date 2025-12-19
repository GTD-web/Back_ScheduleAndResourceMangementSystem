import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance } from '../../../libs/entities/maintenance.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';

@Injectable()
export class DomainMaintenanceRepository extends BaseRepository<Maintenance> {
    constructor(
        @InjectRepository(Maintenance)
        repository: Repository<Maintenance>,
    ) {
        super(repository);
    }

    async count(options: IRepositoryOptions<Maintenance>): Promise<number> {
        return await this.repository.count(options);
    }
}
