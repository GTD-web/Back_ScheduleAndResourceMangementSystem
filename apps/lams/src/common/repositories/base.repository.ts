import { Injectable, NotFoundException } from '@nestjs/common';
import { IRepository, IRepositoryOptions } from '../interfaces/repository.interface';
import {
    ObjectLiteral,
    Repository,
    DeepPartial,
    FindOptionsWhere,
    FindOneOptions,
    QueryBuilder,
    SelectQueryBuilder,
} from 'typeorm';

@Injectable()
export abstract class BaseRepository<T extends ObjectLiteral> implements IRepository<T> {
    protected constructor(protected readonly repository: Repository<T>) {}

    // QueryBuilder 접근을 위한 메서드
    createQueryBuilder(alias: string) {
        return this.repository.createQueryBuilder(alias);
    }

    // Transaction Manager 접근을 위한 메서드
    get manager() {
        return this.repository.manager;
    }

    async create(entity: DeepPartial<T>, repositoryOptions?: IRepositoryOptions<T>): Promise<T> {
        const repository = repositoryOptions?.queryRunner
            ? repositoryOptions.queryRunner.manager.getRepository(this.repository.target)
            : this.repository;
        return repository.create(entity);
    }

    async save(entity: DeepPartial<T>, repositoryOptions?: IRepositoryOptions<T>): Promise<T> {
        const repository = repositoryOptions?.queryRunner
            ? repositoryOptions.queryRunner.manager.getRepository(this.repository.target)
            : this.repository;
        return repository.save(entity);
    }

    async findOne(repositoryOptions?: IRepositoryOptions<T>): Promise<T | null> {
        const repository = repositoryOptions?.queryRunner
            ? repositoryOptions.queryRunner.manager.getRepository(this.repository.target)
            : this.repository;
        return await repository.findOne({
            where: repositoryOptions?.where,
            relations: repositoryOptions?.relations,
            select: repositoryOptions?.select,
            order: repositoryOptions?.order,
            withDeleted: repositoryOptions?.withDeleted,
        });
    }

    async findAll(repositoryOptions?: IRepositoryOptions<T>): Promise<T[]> {
        const repository = repositoryOptions?.queryRunner
            ? repositoryOptions.queryRunner.manager.getRepository(this.repository.target)
            : this.repository;
        return repository.find({
            where: repositoryOptions?.where,
            relations: repositoryOptions?.relations,
            select: repositoryOptions?.select,
            order: repositoryOptions?.order,
            skip: repositoryOptions?.skip,
            take: repositoryOptions?.take,
            withDeleted: repositoryOptions?.withDeleted,
        });
    }

    async update(entityId: string, entityData: Partial<T>, repositoryOptions?: IRepositoryOptions<T>): Promise<T> {
        const repository = repositoryOptions?.queryRunner
            ? repositoryOptions.queryRunner.manager.getRepository(this.repository.target)
            : this.repository;
        const primaryColumn = repository.metadata.primaryColumns[0].propertyName;
        await repository.update(entityId, entityData);
        const updated = await repository.findOne({
            where: { [primaryColumn]: entityId } as FindOptionsWhere<T>,
            relations: repositoryOptions?.relations,
            select: repositoryOptions?.select,
            order: repositoryOptions?.order,
            withDeleted: repositoryOptions?.withDeleted,
        });
        if (!updated) {
            throw new NotFoundException(`${this.repository.metadata.name} Entity with id ${entityId} not found`);
        }
        return updated;
    }

    async delete(entityId: string, repositoryOptions?: IRepositoryOptions<T>): Promise<void> {
        const repository = repositoryOptions?.queryRunner
            ? repositoryOptions.queryRunner.manager.getRepository(this.repository.target)
            : this.repository;
        await repository.delete(entityId);
    }
}
