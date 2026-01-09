import { Injectable } from '@nestjs/common';
import { DataSnapshotContext } from '../../context/data-snapshot';
import { DataSnapshotInfo, SnapshotType } from '../../domain/data-snapshot-info/data-snapshot-info.entity';
import { MonthlyEventSummary } from '../../domain/monthly-event-summary/monthly-event-summary.entity';

/**
 * 데이터 스냅샷 비즈니스 서비스
 *
 * 컨트롤러와 컨텍스트 사이의 비즈니스 로직을 처리합니다.
 */
@Injectable()
export class DataSnapshotService {
    constructor(private readonly dataSnapshotContext: DataSnapshotContext) {}

    /**
     * 스냅샷 생성
     */
    async createSnapshot(params: {
        snapshotName: string;
        description: string;
        snapshotType: SnapshotType;
        yyyy: string;
        mm: string;
        monthlySummaries: MonthlyEventSummary[];
    }): Promise<DataSnapshotInfo> {
        return this.dataSnapshotContext.createSnapshot(params);
    }

    /**
     * 모든 스냅샷 조회
     */
    async getAllSnapshots(): Promise<DataSnapshotInfo[]> {
        return this.dataSnapshotContext.getAllSnapshots();
    }

    /**
     * 특정 스냅샷 조회
     */
    async getSnapshotById(dataSnapshotId: string): Promise<DataSnapshotInfo> {
        return this.dataSnapshotContext.getSnapshotById(dataSnapshotId);
    }

    /**
     * 특정 연월의 스냅샷 조회
     */
    async getSnapshotsByYearMonth(yyyy: string, mm: string): Promise<DataSnapshotInfo[]> {
        return this.dataSnapshotContext.getSnapshotsByYearMonth(yyyy, mm);
    }

    /**
     * 특정 타입의 스냅샷 조회
     */
    async getSnapshotsByType(snapshotType: SnapshotType): Promise<DataSnapshotInfo[]> {
        return this.dataSnapshotContext.getSnapshotsByType(snapshotType);
    }

    /**
     * 특정 연월 및 타입의 스냅샷 조회
     */
    async getSnapshotsByYearMonthAndType(
        yyyy: string,
        mm: string,
        snapshotType: SnapshotType,
    ): Promise<DataSnapshotInfo[]> {
        return this.dataSnapshotContext.getSnapshotsByYearMonthAndType(yyyy, mm, snapshotType);
    }

    /**
     * 스냅샷 수정
     */
    async updateSnapshot(
        dataSnapshotId: string,
        dto: { snapshotName?: string; snapshotDescription?: string },
    ): Promise<DataSnapshotInfo> {
        return this.dataSnapshotContext.updateSnapshot(dataSnapshotId, dto);
    }

    /**
     * 스냅샷 삭제
     */
    async deleteSnapshot(dataSnapshotId: string): Promise<void> {
        return this.dataSnapshotContext.deleteSnapshot(dataSnapshotId);
    }
}
