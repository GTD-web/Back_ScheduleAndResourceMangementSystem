import { Injectable } from '@nestjs/common';
import { DomainDataSnapshotInfoRepository } from './data-snapshot-info.repository';
import { BaseService } from '../../../common/services/base.service';
import { DataSnapshotInfo, SnapshotType } from './data-snapshot-info.entity';

@Injectable()
export class DomainDataSnapshotInfoService extends BaseService<DataSnapshotInfo> {
    constructor(private readonly dataSnapshotInfoRepository: DomainDataSnapshotInfoRepository) {
        super(dataSnapshotInfoRepository);
    }

    /**
     * 모든 스냅샷 조회 (children 포함)
     */
    async findAllWithChildren(): Promise<DataSnapshotInfo[]> {
        return this.dataSnapshotInfoRepository.findAllWithChildren();
    }

    /**
     * 특정 스냅샷 조회 (children 포함)
     */
    async findOneWithChildren(dataSnapshotId: string): Promise<DataSnapshotInfo | null> {
        return this.dataSnapshotInfoRepository.findOneWithChildren(dataSnapshotId);
    }

    /**
     * 특정 연월의 스냅샷 조회 (children 포함)
     */
    async findByYearMonth(yyyy: string, mm: string): Promise<DataSnapshotInfo[]> {
        return this.dataSnapshotInfoRepository.findByYearMonth(yyyy, mm);
    }

    /**
     * 특정 타입의 스냅샷 조회 (children 포함)
     */
    async findBySnapshotType(snapshotType: SnapshotType): Promise<DataSnapshotInfo[]> {
        return this.dataSnapshotInfoRepository.findBySnapshotType(snapshotType);
    }

    /**
     * 특정 연월 및 타입의 스냅샷 조회
     */
    async findByYearMonthAndType(yyyy: string, mm: string, snapshotType: SnapshotType): Promise<DataSnapshotInfo[]> {
        return this.dataSnapshotInfoRepository.findByYearMonthAndType(yyyy, mm, snapshotType);
    }
}
