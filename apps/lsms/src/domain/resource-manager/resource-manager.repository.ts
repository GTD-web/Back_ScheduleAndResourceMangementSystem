import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceManager } from './resource-manager.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainResourceManagerRepository extends BaseRepository<ResourceManager> {
    constructor(
        @InjectRepository(ResourceManager)
        repository: Repository<ResourceManager>,
    ) {
        super(repository);
    }
}
