import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, DataSource } from 'typeorm';
import { EmployeeDepartmentPosition } from './employee-department-position.entity';

/**
 * 직원-부서-직책 서비스
 *
 * 직원-부서-직책 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainEmployeeDepartmentPositionService {
    constructor(
        @InjectRepository(EmployeeDepartmentPosition)
        private readonly repository: Repository<EmployeeDepartmentPosition>,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<EmployeeDepartmentPosition> {
        return manager ? manager.getRepository(EmployeeDepartmentPosition) : this.repository;
    }

    /**
     * 엔티티를 저장한다
     */
    async save(
        entity: EmployeeDepartmentPosition,
        options?: { queryRunner?: any },
    ): Promise<EmployeeDepartmentPosition> {
        const repository = options?.queryRunner
            ? options.queryRunner.manager.getRepository(EmployeeDepartmentPosition)
            : this.repository;
        return await repository.save(entity);
    }

    /**
     * 모든 엔티티를 조회한다
     */
    async findAll(manager?: EntityManager): Promise<EmployeeDepartmentPosition[]> {
        const repository = this.getRepository(manager);
        return await repository.find();
    }

    /**
     * ID로 엔티티를 조회한다
     */
    async findOne(id: string, manager?: EntityManager): Promise<EmployeeDepartmentPosition | null> {
        const repository = this.getRepository(manager);
        return await repository.findOne({ where: { id } });
    }
}
