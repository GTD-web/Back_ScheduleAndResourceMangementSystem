import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { DataSnapshotInfo } from './data-snapshot-info.entity';
import {
    CreateDataSnapshotInfoData,
    UpdateDataSnapshotInfoData,
    SnapshotType,
    DataSnapshotInfoDTO,
} from './data-snapshot-info.types';

/**
 * 데이터 스냅샷 정보 서비스
 *
 * 데이터 스냅샷 정보 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainDataSnapshotInfoService {
    constructor(
        @InjectRepository(DataSnapshotInfo)
        private readonly repository: Repository<DataSnapshotInfo>,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<DataSnapshotInfo> {
        return manager ? manager.getRepository(DataSnapshotInfo) : this.repository;
    }

    /**
     * 데이터 스냅샷 정보를 생성한다
     */
    async 생성한다(data: CreateDataSnapshotInfoData, manager?: EntityManager): Promise<DataSnapshotInfoDTO> {
        const repository = this.getRepository(manager);

        const snapshot = new DataSnapshotInfo(
            data.snapshotName,
            data.snapshotType,
            data.yyyy,
            data.mm,
            data.departmentId,
            data.description || '',
        );

        const saved = await repository.save(snapshot);
        return saved.DTO변환한다();
    }

    /**
     * ID로 데이터 스냅샷 정보를 조회한다
     */
    async ID로조회한다(id: string): Promise<DataSnapshotInfoDTO> {
        const snapshot = await this.repository.findOne({
            where: { id },
            relations: ['dataSnapshotChildInfoList', 'department'],
        });
        if (!snapshot) {
            throw new NotFoundException(`데이터 스냅샷 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        return snapshot.DTO변환한다();
    }

    /**
     * 모든 스냅샷 목록을 조회한다 (children 포함)
     */
    async 자식포함목록조회한다(): Promise<DataSnapshotInfoDTO[]> {
        const snapshots = await this.repository.find({
            where: { deleted_at: IsNull() },
            relations: ['dataSnapshotChildInfoList'],
            order: {
                created_at: 'DESC',
            },
        });
        return snapshots.map((snapshot) => snapshot.DTO변환한다());
    }

    /**
     * 특정 스냅샷을 조회한다 (children 포함)
     */
    async 자식포함조회한다(id: string): Promise<DataSnapshotInfoDTO | null> {
        const snapshot = await this.repository.findOne({
            where: { id, deleted_at: IsNull() },
            relations: ['dataSnapshotChildInfoList'],
        });
        return snapshot ? snapshot.DTO변환한다() : null;
    }

    /**
     * 특정 연월의 스냅샷 목록을 조회한다 (children 포함)
     */
    async 연월로목록조회한다(yyyy: string, mm: string): Promise<DataSnapshotInfoDTO[]> {
        const snapshots = await this.repository.find({
            where: { yyyy, mm, deleted_at: IsNull() },
            relations: ['dataSnapshotChildInfoList'],
            order: {
                created_at: 'DESC',
            },
        });
        return snapshots.map((snapshot) => snapshot.DTO변환한다());
    }

    /**
     * 특정 타입의 스냅샷 목록을 조회한다 (children 포함)
     */
    async 타입으로목록조회한다(snapshotType: SnapshotType): Promise<DataSnapshotInfoDTO[]> {
        const snapshots = await this.repository.find({
            where: { snapshot_type: snapshotType, deleted_at: IsNull() },
            relations: ['dataSnapshotChildInfoList'],
            order: {
                created_at: 'DESC',
            },
        });
        return snapshots.map((snapshot) => snapshot.DTO변환한다());
    }

    /**
     * 특정 연월 및 타입의 스냅샷 목록을 조회한다
     */
    async 연월과타입으로목록조회한다(
        yyyy: string,
        mm: string,
        snapshotType: SnapshotType,
    ): Promise<DataSnapshotInfoDTO[]> {
        const snapshots = await this.repository.find({
            where: { yyyy, mm, snapshot_type: snapshotType, deleted_at: IsNull() },
            relations: ['dataSnapshotChildInfoList'],
            order: {
                created_at: 'DESC',
            },
        });
        return snapshots.map((snapshot) => snapshot.DTO변환한다());
    }

    /**
     * 데이터 스냅샷 정보를 수정한다
     */
    async 수정한다(
        id: string,
        data: UpdateDataSnapshotInfoData,
        userId: string,
        manager?: EntityManager,
    ): Promise<DataSnapshotInfoDTO> {
        const repository = this.getRepository(manager);
        const snapshot = await repository.findOne({ where: { id } });
        if (!snapshot) {
            throw new NotFoundException(`데이터 스냅샷 정보를 찾을 수 없습니다. (id: ${id})`);
        }

        snapshot.업데이트한다(data.snapshotName, data.description);

        // 수정자 정보 설정
        snapshot.수정자설정한다(userId);
        snapshot.메타데이터업데이트한다(userId);

        const saved = await repository.save(snapshot);
        return saved.DTO변환한다();
    }

    /**
     * 데이터 스냅샷 정보를 삭제한다 (Soft Delete)
     */
    async 삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const snapshot = await repository.findOne({ where: { id } });
        if (!snapshot) {
            throw new NotFoundException(`데이터 스냅샷 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        snapshot.deleted_at = new Date();
        // 삭제자 정보 설정
        snapshot.수정자설정한다(userId);
        snapshot.메타데이터업데이트한다(userId);
        await repository.save(snapshot);
    }

    /**
     * 데이터 스냅샷 정보를 완전히 삭제한다 (Hard Delete)
     */
    async 완전삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        // Soft Delete된 데이터 스냅샷 정보도 조회할 수 있도록 withDeleted 옵션 사용
        const snapshot = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!snapshot) {
            throw new NotFoundException(`데이터 스냅샷 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        // Hard Delete: 데이터베이스에서 완전히 삭제
        await repository.remove(snapshot);
    }
}
