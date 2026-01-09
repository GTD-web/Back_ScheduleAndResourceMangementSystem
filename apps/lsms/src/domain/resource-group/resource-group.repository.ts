import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceGroup } from './resource-group.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainResourceGroupRepository extends BaseRepository<ResourceGroup> {
    constructor(
        @InjectRepository(ResourceGroup)
        repository: Repository<ResourceGroup>,
    ) {
        super(repository);
    }
}
