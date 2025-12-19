import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainResourceManagerRepository } from './resource-manager.repository';
import { BaseService } from '../../../libs/services/base.service';
import { ResourceManager } from '../../../libs/entities/resource-manager.entity';

@Injectable()
export class DomainResourceManagerService extends BaseService<ResourceManager> {
    constructor(private readonly resourceManagerRepository: DomainResourceManagerRepository) {
        super(resourceManagerRepository);
    }
}
