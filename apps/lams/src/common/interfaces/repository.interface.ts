import {
    ObjectLiteral,
    QueryRunner,
    FindOptionsWhere,
    DeepPartial,
    FindOptionsOrder,
    FindOptionsSelect,
} from 'typeorm';

export interface IRepositoryOptions<T> {
    queryRunner?: QueryRunner;
    where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
    relations?: string[];
    select?: FindOptionsSelect<T>;
    order?: FindOptionsOrder<T>;
    skip?: number;
    take?: number;
    withDeleted?: boolean;
}

export interface IRepository<T extends ObjectLiteral> {
    create(entity: DeepPartial<T>, repositoryOptions?: IRepositoryOptions<T>): Promise<T>;
    save(entity: DeepPartial<T>, repositoryOptions?: IRepositoryOptions<T>): Promise<T>;
    findOne(repositoryOptions?: IRepositoryOptions<T>): Promise<T | null>;
    findAll(repositoryOptions?: IRepositoryOptions<T>): Promise<T[]>;
    update(entityId: string, entity: Partial<T>, repositoryOptions?: IRepositoryOptions<T>): Promise<T>;
    delete(entityId: string, repositoryOptions?: IRepositoryOptions<T>): Promise<void>;
}
