import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DomainDataSnapshotInfoService } from '../../domain/data-snapshot-info/data-snapshot-info.service';
import { DomainDataSnapshotChildService } from '../../domain/data-snapshot-child/data-snapshot-child.service';
import { DataSnapshotInfo, SnapshotType } from '../../domain/data-snapshot-info/data-snapshot-info.entity';
import { DataSnapshotChild } from '../../domain/data-snapshot-child/data-snapshot-child.entity';
import { MonthlyEventSummary } from '../../domain/monthly-event-summary/monthly-event-summary.entity';

/**
 * 데이터 스냅샷 Context
 *
 * 여러 도메인 서비스를 조합하여 스냅샷 생성 및 조회 비즈니스 로직을 처리합니다.
 */
@Injectable()
export class DataSnapshotContext {
    private readonly logger = new Logger(DataSnapshotContext.name);

    constructor(
        private readonly dataSnapshotInfoService: DomainDataSnapshotInfoService,
        private readonly dataSnapshotChildService: DomainDataSnapshotChildService,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * 스냅샷 생성
     * 월간 요약 데이터 배열을 받아 스냅샷을 생성합니다.
     */
    async createSnapshot(params: {
        snapshotName: string;
        description: string;
        snapshotType: SnapshotType;
        yyyy: string;
        mm: string;
        monthlySummaries: MonthlyEventSummary[];
    }): Promise<DataSnapshotInfo> {
        const { snapshotName, description, snapshotType, yyyy, mm, monthlySummaries } = params;

        this.logger.log(`스냅샷 생성 시작: ${snapshotName} (${yyyy}-${mm})`);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. DataSnapshotChild 생성
            const dataSnapshotChildInfoList = monthlySummaries.map((summary) => {
                const child = new DataSnapshotChild();
                child.employeeId = summary.employeeId;
                child.employeeName = summary.employeeName;
                child.employeeNumber = summary.employeeNumber;
                child.yyyy = yyyy;
                child.mm = mm;
                // MonthlyEventSummary 전체를 JSON으로 저장
                child.snapshotData = JSON.stringify(summary);

                return child;
            });

            // 2. DataSnapshotInfo 생성 (cascade로 children도 함께 저장됨)
            const snapshot = DataSnapshotInfo.createSnapshot({
                snapshotName,
                description,
                snapshotType,
                yyyy,
                mm,
                department: null, // TODO: 추후 제거 예정
                dataSnapshotChildInfoList,
            });

            // 3. 저장
            const savedSnapshot = await queryRunner.manager.save(DataSnapshotInfo, snapshot);

            await queryRunner.commitTransaction();

            this.logger.log(
                `스냅샷 생성 완료: ${savedSnapshot.dataSnapshotId} (${dataSnapshotChildInfoList.length}건)`,
            );

            return savedSnapshot;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`스냅샷 생성 실패: ${error.message}`, error.stack);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 모든 스냅샷 조회
     */
    async getAllSnapshots(): Promise<DataSnapshotInfo[]> {
        return this.dataSnapshotInfoService.findAllWithChildren();
    }

    /**
     * 특정 스냅샷 조회 (ID로)
     */
    async getSnapshotById(dataSnapshotId: string): Promise<DataSnapshotInfo> {
        const snapshot = await this.dataSnapshotInfoService.findOneWithChildren(dataSnapshotId);

        if (!snapshot) {
            throw new NotFoundException(`스냅샷을 찾을 수 없습니다: ${dataSnapshotId}`);
        }

        return snapshot;
    }

    /**
     * 특정 연월의 스냅샷 조회
     */
    async getSnapshotsByYearMonth(yyyy: string, mm: string): Promise<DataSnapshotInfo[]> {
        return this.dataSnapshotInfoService.findByYearMonth(yyyy, mm);
    }

    /**
     * 특정 타입의 스냅샷 조회
     */
    async getSnapshotsByType(snapshotType: SnapshotType): Promise<DataSnapshotInfo[]> {
        return this.dataSnapshotInfoService.findBySnapshotType(snapshotType);
    }

    /**
     * 특정 연월 및 타입의 스냅샷 조회
     */
    async getSnapshotsByYearMonthAndType(
        yyyy: string,
        mm: string,
        snapshotType: SnapshotType,
    ): Promise<DataSnapshotInfo[]> {
        return this.dataSnapshotInfoService.findByYearMonthAndType(yyyy, mm, snapshotType);
    }

    /**
     * 스냅샷 수정 (이름, 설명만)
     */
    async updateSnapshot(
        dataSnapshotId: string,
        dto: { snapshotName?: string; snapshotDescription?: string },
    ): Promise<DataSnapshotInfo> {
        const snapshot = await this.dataSnapshotInfoService.findOneWithChildren(dataSnapshotId);

        if (!snapshot) {
            throw new NotFoundException(`스냅샷을 찾을 수 없습니다: ${dataSnapshotId}`);
        }

        snapshot.updateSnapshot(dto);
        const updatedSnapshot = await this.dataSnapshotInfoService.save(snapshot);

        this.logger.log(`스냅샷 수정 완료: ${dataSnapshotId}`);

        return updatedSnapshot;
    }

    /**
     * 스냅샷 삭제
     */
    async deleteSnapshot(dataSnapshotId: string): Promise<void> {
        const snapshot = await this.dataSnapshotInfoService.findOne({ where: { dataSnapshotId } });

        if (!snapshot) {
            throw new NotFoundException(`스냅샷을 찾을 수 없습니다: ${dataSnapshotId}`);
        }

        // cascade 설정으로 children도 함께 삭제됨
        await this.dataSnapshotInfoService.delete(dataSnapshotId);

        this.logger.log(`스냅샷 삭제 완료: ${dataSnapshotId}`);
    }
}
