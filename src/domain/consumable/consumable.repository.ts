import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consumable } from '../../../libs/entities/consumable.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';

@Injectable()
export class DomainConsumableRepository extends BaseRepository<Consumable> {
    constructor(
        @InjectRepository(Consumable)
        repository: Repository<Consumable>,
    ) {
        super(repository);
    }

    async bulkCreate(consumables: Consumable[], repositoryOptions?: IRepositoryOptions<Consumable>) {
        const repository = repositoryOptions?.queryRunner
            ? repositoryOptions.queryRunner.manager.getRepository(this.repository.target)
            : this.repository;
        return repository.save(consumables);
    }
}
