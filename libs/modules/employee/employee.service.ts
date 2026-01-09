import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, DataSource } from 'typeorm';
import { Employee } from './employee.entity';

/**
 * 직원 서비스
 *
 * 직원 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainEmployeeService {
    constructor(
        @InjectRepository(Employee)
        private readonly repository: Repository<Employee>,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<Employee> {
        return manager ? manager.getRepository(Employee) : this.repository;
    }

    /**
     * 엔티티를 저장한다
     */
    async save(entity: Employee, options?: { queryRunner?: any }): Promise<Employee> {
        const repository = options?.queryRunner ? options.queryRunner.manager.getRepository(Employee) : this.repository;
        return await repository.save(entity);
    }

    /**
     * 모든 엔티티를 조회한다
     */
    async findAll(manager?: EntityManager): Promise<Employee[]> {
        const repository = this.getRepository(manager);
        return await repository.find();
    }

    /**
     * ID로 엔티티를 조회한다
     */
    async findOne(id: string, manager?: EntityManager): Promise<Employee | null> {
        const repository = this.getRepository(manager);
        return await repository.findOne({ where: { id } });
    }
}
