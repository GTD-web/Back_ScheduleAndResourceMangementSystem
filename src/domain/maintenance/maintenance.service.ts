import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainMaintenanceRepository } from './maintenance.repository';
import { BaseService } from '../../../libs/services/base.service';
import { Maintenance } from '../../../libs/entities/maintenance.entity';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';
import { Between } from 'typeorm';

@Injectable()
export class DomainMaintenanceService extends BaseService<Maintenance> {
    constructor(private readonly maintenanceRepository: DomainMaintenanceRepository) {
        super(maintenanceRepository);
    }
}
