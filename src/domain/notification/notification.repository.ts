import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Notification } from '../../../libs/entities/notification.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';

@Injectable()
export class DomainNotificationRepository extends BaseRepository<Notification> {
    constructor(
        @InjectRepository(Notification)
        repository: Repository<Notification>,
    ) {
        super(repository);
    }

    async count(repositoryOptions: IRepositoryOptions<Notification>): Promise<number> {
        const repository = repositoryOptions?.queryRunner
            ? repositoryOptions.queryRunner.manager.getRepository(this.repository.target)
            : this.repository;
        return repository.count({
            where: repositoryOptions?.where,
            relations: repositoryOptions?.relations,
            select: repositoryOptions?.select,
            order: repositoryOptions?.order,
            skip: repositoryOptions?.skip,
            take: repositoryOptions?.take,
            withDeleted: repositoryOptions?.withDeleted,
        });
    }

    async bulkUpdate(
        entityIds: string[],
        entityData: Partial<Notification>,
        repositoryOptions?: IRepositoryOptions<Notification>,
    ): Promise<UpdateResult> {
        const repository = repositoryOptions?.queryRunner
            ? repositoryOptions.queryRunner.manager.getRepository(this.repository.target)
            : this.repository;
        return await repository.update(entityIds, entityData);
    }
}
