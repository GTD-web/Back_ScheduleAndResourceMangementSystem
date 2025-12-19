import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from '../../../libs/entities/resource.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';

@Injectable()
export class DomainResourceRepository extends BaseRepository<Resource> {
    constructor(
        @InjectRepository(Resource)
        repository: Repository<Resource>,
    ) {
        super(repository);
    }

    async softDelete(resourceId: string, repositoryOptions?: IRepositoryOptions<Resource>) {
        const repository = repositoryOptions?.queryRunner
            ? repositoryOptions.queryRunner.manager.getRepository(this.repository.target)
            : this.repository;
        await repository.softDelete(resourceId);
    }
}
