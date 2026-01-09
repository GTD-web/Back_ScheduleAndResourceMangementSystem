import { DeepPartial, ObjectLiteral } from 'typeorm';
import { IRepositoryOptions } from './repository.interface';

export interface IService<T extends ObjectLiteral> {
    create(entity: DeepPartial<T>, options?: IRepositoryOptions<T>): Promise<T>;
    save(entity: DeepPartial<T>, options?: IRepositoryOptions<T>): Promise<T>;
    findAll(options?: IRepositoryOptions<T>): Promise<T[]>;
    findOne(options: IRepositoryOptions<T>): Promise<T | null>;
    update(id: string, entity: Partial<T>, options?: IRepositoryOptions<T>): Promise<T>;
    delete(id: string, options?: IRepositoryOptions<T>): Promise<void>;
}
