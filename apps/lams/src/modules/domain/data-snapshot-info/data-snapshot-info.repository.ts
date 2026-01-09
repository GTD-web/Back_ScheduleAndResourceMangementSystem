import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSnapshotInfo, SnapshotType } from './data-snapshot-info.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class DomainDataSnapshotInfoRepository extends BaseRepository<DataSnapshotInfo> {
    constructor(
        @InjectRepository(DataSnapshotInfo)
        repository: Repository<DataSnapshotInfo>,
    ) {
        super(repository);
    }

    /**
     * 모든 스냅샷 조회 (children 포함)
     */
    async findAllWithChildren(): Promise<DataSnapshotInfo[]> {
        return this.repository.find({
            relations: ['dataSnapshotChildInfoList'],
            order: {
                createdAt: 'DESC',
            },
        });
    }

    /**
     * 특정 스냅샷 조회 (children 포함)
     */
    async findOneWithChildren(dataSnapshotId: string): Promise<DataSnapshotInfo | null> {
        return this.repository.findOne({
            where: { dataSnapshotId },
            relations: ['dataSnapshotChildInfoList'],
        });
    }

    /**
     * 특정 연월의 스냅샷 조회 (children 포함)
     */
    async findByYearMonth(yyyy: string, mm: string): Promise<DataSnapshotInfo[]> {
        return this.repository.find({
            where: { yyyy, mm },
            relations: ['dataSnapshotChildInfoList'],
            order: {
                createdAt: 'DESC',
            },
        });
    }

    /**
     * 특정 타입의 스냅샷 조회 (children 포함)
     */
    async findBySnapshotType(snapshotType: SnapshotType): Promise<DataSnapshotInfo[]> {
        return this.repository.find({
            where: { snapshotType },
            relations: ['dataSnapshotChildInfoList'],
            order: {
                createdAt: 'DESC',
            },
        });
    }

    /**
     * 특정 연월 및 타입의 스냅샷 조회
     */
    async findByYearMonthAndType(yyyy: string, mm: string, snapshotType: SnapshotType): Promise<DataSnapshotInfo[]> {
        return this.repository.find({
            where: { yyyy, mm, snapshotType },
            relations: ['dataSnapshotChildInfoList'],
            order: {
                createdAt: 'DESC',
            },
        });
    }
}
