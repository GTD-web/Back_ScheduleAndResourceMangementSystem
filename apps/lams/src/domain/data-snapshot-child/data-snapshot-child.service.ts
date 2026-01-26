import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { DataSnapshotChild } from './data-snapshot-child.entity';
import {
    CreateDataSnapshotChildData,
    UpdateDataSnapshotChildData,
    DataSnapshotChildDTO,
} from './data-snapshot-child.types';

/**
 * 데이터 스냅샷 자식 서비스
 *
 * 데이터 스냅샷 자식 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainDataSnapshotChildService {
    constructor(
        @InjectRepository(DataSnapshotChild)
        private readonly repository: Repository<DataSnapshotChild>,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<DataSnapshotChild> {
        return manager ? manager.getRepository(DataSnapshotChild) : this.repository;
    }

    /**
     * 데이터 스냅샷 자식을 생성한다
     */
    async 생성한다(data: CreateDataSnapshotChildData, manager?: EntityManager): Promise<DataSnapshotChildDTO> {
        const repository = this.getRepository(manager);

        const child = new DataSnapshotChild(
            data.employeeId,
            data.employeeName,
            data.employeeNumber,
            data.yyyy,
            data.mm,
            data.snapshotData,
        );

        const saved = await repository.save(child);
        return saved.DTO변환한다();
    }

    /**
     * ID로 데이터 스냅샷 자식을 조회한다
     */
    async ID로조회한다(id: string): Promise<DataSnapshotChildDTO> {
        const child = await this.repository.findOne({
            where: { id },
            relations: ['employee', 'parentSnapshot'],
        });
        if (!child) {
            throw new NotFoundException(`데이터 스냅샷 자식을 찾을 수 없습니다. (id: ${id})`);
        }
        return child.DTO변환한다();
    }

    /**
     * 데이터 스냅샷 자식 목록을 조회한다
     */
    async 목록조회한다(): Promise<DataSnapshotChildDTO[]> {
        const children = await this.repository.find({
            where: { deleted_at: IsNull() },
            relations: ['employee', 'parentSnapshot'],
            order: { created_at: 'DESC' },
        });
        return children.map((child) => child.DTO변환한다());
    }

    /**
     * 데이터 스냅샷 자식 정보를 수정한다
     */
    async 수정한다(
        id: string,
        data: UpdateDataSnapshotChildData,
        userId: string,
        manager?: EntityManager,
    ): Promise<DataSnapshotChildDTO> {
        const repository = this.getRepository(manager);
        const child = await repository.findOne({ where: { id } });
        if (!child) {
            throw new NotFoundException(`데이터 스냅샷 자식을 찾을 수 없습니다. (id: ${id})`);
        }

        child.업데이트한다(data.employeeName, data.employeeNumber, data.snapshotData);

        // 수정자 정보 설정
        child.수정자설정한다(userId);
        child.메타데이터업데이트한다(userId);

        const saved = await repository.save(child);
        return saved.DTO변환한다();
    }

    /**
     * 데이터 스냅샷 자식을 삭제한다 (Soft Delete)
     */
    async 삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const child = await repository.findOne({ where: { id } });
        if (!child) {
            throw new NotFoundException(`데이터 스냅샷 자식을 찾을 수 없습니다. (id: ${id})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        child.deleted_at = new Date();
        // 삭제자 정보 설정
        child.수정자설정한다(userId);
        child.메타데이터업데이트한다(userId);
        await repository.save(child);
    }

    /**
     * 데이터 스냅샷 자식을 완전히 삭제한다 (Hard Delete)
     */
    async 완전삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        // Soft Delete된 데이터 스냅샷 자식도 조회할 수 있도록 withDeleted 옵션 사용
        const child = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!child) {
            throw new NotFoundException(`데이터 스냅샷 자식을 찾을 수 없습니다. (id: ${id})`);
        }
        // Hard Delete: 데이터베이스에서 완전히 삭제
        await repository.remove(child);
    }
}
