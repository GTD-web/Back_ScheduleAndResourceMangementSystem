import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { DailySummaryChangeHistory } from './daily-summary-change-history.entity';
import {
    CreateDailySummaryChangeHistoryData,
    UpdateDailySummaryChangeHistoryData,
    DailySummaryChangeHistoryDTO,
} from './daily-summary-change-history.types';

/**
 * 일간 요약 변경 이력 서비스
 *
 * 일간 요약 변경 이력 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainDailySummaryChangeHistoryService {
    constructor(
        @InjectRepository(DailySummaryChangeHistory)
        private readonly repository: Repository<DailySummaryChangeHistory>,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<DailySummaryChangeHistory> {
        return manager ? manager.getRepository(DailySummaryChangeHistory) : this.repository;
    }

    /**
     * 일간 요약 변경 이력을 생성한다
     */
    async 생성한다(
        data: CreateDailySummaryChangeHistoryData,
        manager?: EntityManager,
    ): Promise<DailySummaryChangeHistoryDTO> {
        const repository = this.getRepository(manager);

        const history = new DailySummaryChangeHistory(
            data.dailyEventSummaryId,
            data.date,
            data.content,
            data.changedBy,
            data.reason,
            data.snapshotId,
        );

        const saved = await repository.save(history);
        return saved.DTO변환한다();
    }

    /**
     * ID로 일간 요약 변경 이력을 조회한다
     */
    async ID로조회한다(id: string): Promise<DailySummaryChangeHistoryDTO> {
        const history = await this.repository.findOne({
            where: { id },
            relations: ['dailyEventSummary'],
        });
        if (!history) {
            throw new NotFoundException(`일간 요약 변경 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        return history.DTO변환한다();
    }

    /**
     * 일간 요약 ID로 변경 이력 목록을 조회한다
     */
    async 일간요약ID로목록조회한다(dailyEventSummaryId: string): Promise<DailySummaryChangeHistoryDTO[]> {
        const histories = await this.repository.find({
            where: { daily_event_summary_id: dailyEventSummaryId, deleted_at: IsNull() },
            order: { changed_at: 'DESC' },
        });
        return histories.map((history) => history.DTO변환한다());
    }

    /**
     * 날짜 범위로 변경 이력 목록을 조회한다
     */
    async 날짜범위로목록조회한다(startDate: string, endDate: string): Promise<DailySummaryChangeHistoryDTO[]> {
        const histories = await this.repository
            .createQueryBuilder('history')
            .where('history.deleted_at IS NULL')
            .andWhere('history.date >= :startDate', { startDate })
            .andWhere('history.date <= :endDate', { endDate })
            .orderBy('history.changed_at', 'DESC')
            .getMany();
        return histories.map((history) => history.DTO변환한다());
    }

    /**
     * 변경자로 변경 이력 목록을 조회한다
     */
    async 변경자로목록조회한다(changedBy: string): Promise<DailySummaryChangeHistoryDTO[]> {
        const histories = await this.repository.find({
            where: { changed_by: changedBy, deleted_at: IsNull() },
            order: { changed_at: 'DESC' },
        });
        return histories.map((history) => history.DTO변환한다());
    }

    /**
     * 특정 날짜의 변경 이력 목록을 조회한다
     */
    async 날짜로목록조회한다(date: string): Promise<DailySummaryChangeHistoryDTO[]> {
        const histories = await this.repository.find({
            where: { date, deleted_at: IsNull() },
            order: { changed_at: 'DESC' },
        });
        return histories.map((history) => history.DTO변환한다());
    }

    /**
     * 일간 요약 변경 이력 정보를 수정한다
     */
    async 수정한다(
        id: string,
        data: UpdateDailySummaryChangeHistoryData,
        userId: string,
        manager?: EntityManager,
    ): Promise<DailySummaryChangeHistoryDTO> {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new NotFoundException(`일간 요약 변경 이력을 찾을 수 없습니다. (id: ${id})`);
        }

        history.업데이트한다(data.content, data.reason, data.snapshotId);

        // 수정자 정보 설정
        history.수정자설정한다(userId);
        history.메타데이터업데이트한다(userId);

        const saved = await repository.save(history);
        return saved.DTO변환한다();
    }

    /**
     * 일간 요약 변경 이력을 삭제한다 (Soft Delete)
     */
    async 삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new NotFoundException(`일간 요약 변경 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        history.deleted_at = new Date();
        // 삭제자 정보 설정
        history.수정자설정한다(userId);
        history.메타데이터업데이트한다(userId);
        await repository.save(history);
    }

    /**
     * 일간 요약 변경 이력을 완전히 삭제한다 (Hard Delete)
     */
    async 완전삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        // Soft Delete된 일간 요약 변경 이력도 조회할 수 있도록 withDeleted 옵션 사용
        const history = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!history) {
            throw new NotFoundException(`일간 요약 변경 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        // Hard Delete: 데이터베이스에서 완전히 삭제
        await repository.remove(history);
    }
}
