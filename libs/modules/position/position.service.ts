import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, DataSource } from 'typeorm';
import { Position } from './position.entity';

/**
 * 직책 서비스
 *
 * 직책 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainPositionService {
    constructor(
        @InjectRepository(Position)
        private readonly repository: Repository<Position>,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<Position> {
        return manager ? manager.getRepository(Position) : this.repository;
    }

    /**
     * 엔티티를 저장한다
     */
    async save(entity: Position, options?: { queryRunner?: any }): Promise<Position> {
        const repository = options?.queryRunner
            ? options.queryRunner.manager.getRepository(Position)
            : this.repository;
        return await repository.save(entity);
    }

    /**
     * 모든 엔티티를 조회한다
     */
    async findAll(manager?: EntityManager): Promise<Position[]> {
        const repository = this.getRepository(manager);
        return await repository.find();
    }

    /**
     * ID로 엔티티를 조회한다
     */
    async findOne(id: string, manager?: EntityManager): Promise<Position | null> {
        const repository = this.getRepository(manager);
        return await repository.findOne({ where: { id } });
    }
}
