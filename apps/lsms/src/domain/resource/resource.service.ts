import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainResourceRepository } from './resource.repository';
import { BaseService } from '../../../libs/services/base.service';
import { Resource } from './resource.entity';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';
import { In } from 'typeorm';

@Injectable()
export class DomainResourceService extends BaseService<Resource> {
    constructor(private readonly resourceRepository: DomainResourceRepository) {
        super(resourceRepository);
    }

    async softDelete(resourceId: string, options?: IRepositoryOptions<Resource>): Promise<void> {
        await this.resourceRepository.softDelete(resourceId, options);
    }

    async findByResourceId(resourceId: string): Promise<Resource> {
        return this.resourceRepository.findOne({
            where: { resourceId },
        });
    }

    async findByResourceGroupIds(resourceGroupIds: string[]): Promise<Resource[]> {
        return this.resourceRepository.findAll({
            where: { resourceGroupId: In(resourceGroupIds) },
            order: { resourceGroup: { order: 'ASC' }, order: 'ASC' },
        });
    }
}
