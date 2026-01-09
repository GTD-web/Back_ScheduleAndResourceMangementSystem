import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository, DataSource } from 'typeorm';
import { DailyEventSummary } from './daily-event-summary.entity';
import {
    CreateDailyEventSummaryData,
    UpdateDailyEventSummaryData,
    DailyEventSummaryDTO,
} from './daily-event-summary.types';

/**
 * 일간 요약 서비스
 *
 * 일간 요약 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainDailyEventSummaryService {
    constructor(
        @InjectRepository(DailyEventSummary)
        private readonly repository: Repository<DailyEventSummary>,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<DailyEventSummary> {
        return manager ? manager.getRepository(DailyEventSummary) : this.repository;
    }

    /**
     * 일간 요약을 생성한다
     */
    async 생성한다(data: CreateDailyEventSummaryData, manager?: EntityManager): Promise<DailyEventSummaryDTO> {
        const repository = this.getRepository(manager);

        const summary = new DailyEventSummary(
            data.date,
            data.employeeId,
            data.monthlyEventSummaryId,
            data.isHoliday !== undefined ? data.isHoliday : false,
            data.enter,
            data.leave,
            data.realEnter,
            data.realLeave,
            data.isChecked !== undefined ? data.isChecked : true,
            data.isLate !== undefined ? data.isLate : false,
            data.isEarlyLeave !== undefined ? data.isEarlyLeave : false,
            data.isAbsent !== undefined ? data.isAbsent : false,
            data.workTime,
            data.note,
        );

        const saved = await repository.save(summary);
        return saved.DTO변환한다();
    }

    /**
     * ID로 일간 요약을 조회한다
     */
    async ID로조회한다(id: string): Promise<DailyEventSummaryDTO> {
        const summary = await this.repository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!summary) {
            throw new NotFoundException(`일간 요약을 찾을 수 없습니다. (id: ${id})`);
        }
        return summary.DTO변환한다();
    }

    /**
     * 특정 기간 동안의 모든 일일 요약 목록을 조회한다 (직원 정보 포함)
     */
    async 날짜범위로조회한다(startDate: string, endDate: string): Promise<DailyEventSummaryDTO[]> {
        const summaries = await this.dataSource.manager
            .createQueryBuilder(DailyEventSummary, 'daily')
            .leftJoinAndSelect('daily.employee', 'employee')
            .where('daily.deleted_at IS NULL')
            .andWhere('daily.date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .orderBy('daily.employee_id', 'ASC')
            .addOrderBy('daily.date', 'ASC')
            .getMany();
        return summaries.map((summary) => summary.DTO변환한다());
    }

    /**
     * 특정 직원의 특정 기간 일일 요약 목록을 조회한다
     */
    async 직원ID와날짜범위로조회한다(
        employeeId: string,
        startDate: string,
        endDate: string,
    ): Promise<DailyEventSummaryDTO[]> {
        const summaries = await this.dataSource.manager
            .createQueryBuilder(DailyEventSummary, 'daily')
            .leftJoinAndSelect('daily.employee', 'employee')
            .where('daily.deleted_at IS NULL')
            .andWhere('daily.employee_id = :employeeId', { employeeId })
            .andWhere('daily.date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .orderBy('daily.date', 'ASC')
            .getMany();
        return summaries.map((summary) => summary.DTO변환한다());
    }

    /**
     * 일간 요약 정보를 수정한다
     */
    async 수정한다(
        id: string,
        data: UpdateDailyEventSummaryData,
        userId: string,
        manager?: EntityManager,
    ): Promise<DailyEventSummaryDTO> {
        const repository = this.getRepository(manager);
        const summary = await repository.findOne({ where: { id } });
        if (!summary) {
            throw new NotFoundException(`일간 요약을 찾을 수 없습니다. (id: ${id})`);
        }

        summary.업데이트한다(
            data.monthlyEventSummaryId,
            data.isHoliday,
            data.enter,
            data.leave,
            data.realEnter,
            data.realLeave,
            data.isChecked,
            data.isLate,
            data.isEarlyLeave,
            data.isAbsent,
            data.workTime,
            data.note,
        );

        // 수정자 정보 설정
        summary.수정자설정한다(userId);
        summary.메타데이터업데이트한다(userId);

        const saved = await repository.save(summary);
        return saved.DTO변환한다();
    }

    /**
     * 일간 요약을 삭제한다 (Soft Delete)
     */
    async 삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const summary = await repository.findOne({ where: { id } });
        if (!summary) {
            throw new NotFoundException(`일간 요약을 찾을 수 없습니다. (id: ${id})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        summary.deleted_at = new Date();
        // 삭제자 정보 설정
        summary.수정자설정한다(userId);
        summary.메타데이터업데이트한다(userId);
        await repository.save(summary);
    }

    /**
     * 일간 요약을 완전히 삭제한다 (Hard Delete)
     */
    async 완전삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        // Soft Delete된 일간 요약도 조회할 수 있도록 withDeleted 옵션 사용
        const summary = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!summary) {
            throw new NotFoundException(`일간 요약을 찾을 수 없습니다. (id: ${id})`);
        }
        // Hard Delete: 데이터베이스에서 완전히 삭제
        await repository.remove(summary);
    }
}
