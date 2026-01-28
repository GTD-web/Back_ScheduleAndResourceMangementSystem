import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { WageCalculationType } from './wage-calculation-type.entity';
import {
    CreateWageCalculationTypeData,
    UpdateWageCalculationTypeData,
    WageCalculationTypeDTO,
    CalculationType,
} from './wage-calculation-type.types';

/**
 * 임금 계산 유형 서비스
 *
 * 전사적으로 적용되는 통상임금제/포괄임금제 상태를 기간별로 관리합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainWageCalculationTypeService {
    constructor(
        @InjectRepository(WageCalculationType)
        private readonly repository: Repository<WageCalculationType>,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<WageCalculationType> {
        return manager ? manager.getRepository(WageCalculationType) : this.repository;
    }

    /**
     * 임금 계산 유형을 생성한다
     *
     * 새로운 임금 계산 유형을 추가할 때, 기존에 적용 중인 임금 계산 유형이 있으면
     * 해당 유형의 is_currently_applied를 false로 변경합니다.
     */
    async 생성한다(
        data: CreateWageCalculationTypeData,
        userId: string,
        manager?: EntityManager,
    ): Promise<WageCalculationTypeDTO> {
        const repository = this.getRepository(manager);

        // 1. 기존에 적용 중인 임금 계산 유형이 있는지 확인
        const existingActive = await repository.findOne({
            where: {
                is_currently_applied: true,
                deleted_at: IsNull(),
            },
            order: { start_date: 'DESC' },
        });

        // 2. 기존 적용 중인 임금 계산 유형이 있으면 비활성화
        if (existingActive) {
            existingActive.업데이트한다(undefined, undefined, undefined, false);
            existingActive.수정자설정한다(userId);
            existingActive.메타데이터업데이트한다(userId);
            await repository.save(existingActive);
        }

        // 3. 새로운 임금 계산 유형 생성
        const wageCalculationType = new WageCalculationType(
            data.calculationType,
            data.startDate,
            data.changedAt,
            data.isCurrentlyApplied ?? true, // 기본값은 true (새로 생성된 항목은 현재 적용 중)
        );
        wageCalculationType.생성자설정한다(userId);
        wageCalculationType.메타데이터업데이트한다(userId);

        const saved = await repository.save(wageCalculationType);
        return saved.DTO변환한다();
    }

    /**
     * ID로 임금 계산 유형을 조회한다
     */
    async ID로조회한다(id: string, manager?: EntityManager): Promise<WageCalculationTypeDTO> {
        const repository = this.getRepository(manager);
        const wageCalculationType = await repository.findOne({ where: { id } });
        if (!wageCalculationType) {
            throw new NotFoundException(`임금 계산 유형을 찾을 수 없습니다. (id: ${id})`);
        }
        return wageCalculationType.DTO변환한다();
    }

    /**
     * 특정 날짜에 적용되는 임금 계산 유형을 조회한다
     *
     * @param date 조회할 날짜 (yyyy-MM-dd 형식)
     * @param manager 트랜잭션 매니저 (선택)
     * @returns 해당 날짜에 적용되는 임금 계산 유형, 없으면 null
     */
    async 날짜로조회한다(
        date: string,
        manager?: EntityManager,
    ): Promise<WageCalculationTypeDTO | null> {
        const repository = this.getRepository(manager);
        const wageCalculationType = await repository.findOne({
            where: {
                start_date: LessThanOrEqual(date),
                deleted_at: IsNull(),
            },
            order: { start_date: 'DESC' },
        });

        if (!wageCalculationType) {
            return null;
        }

        return wageCalculationType.DTO변환한다();
    }

    /**
     * 현재 적용 중인 임금 계산 유형을 조회한다
     *
     * @param manager 트랜잭션 매니저 (선택)
     * @returns 현재 적용 중인 임금 계산 유형, 없으면 null
     */
    async 현재적용중조회한다(manager?: EntityManager): Promise<WageCalculationTypeDTO | null> {
        const repository = this.getRepository(manager);
        const wageCalculationType = await repository.findOne({
            where: {
                is_currently_applied: true,
                deleted_at: IsNull(),
            },
            order: { start_date: 'DESC' },
        });

        if (!wageCalculationType) {
            return null;
        }

        return wageCalculationType.DTO변환한다();
    }

    /**
     * 기간 범위로 임금 계산 유형 목록을 조회한다
     *
     * @param startDate 시작일 (yyyy-MM-dd 형식)
     * @param endDate 종료일 (yyyy-MM-dd 형식)
     * @param manager 트랜잭션 매니저 (선택)
     * @returns 해당 기간에 적용되는 임금 계산 유형 목록
     */
    async 기간범위로조회한다(
        startDate: string,
        endDate: string,
        manager?: EntityManager,
    ): Promise<WageCalculationTypeDTO[]> {
        const repository = this.getRepository(manager);
        const wageCalculationTypes = await repository.find({
            where: {
                deleted_at: IsNull(),
            },
            order: { start_date: 'ASC' },
        });

        // 기간 범위와 겹치는 임금 계산 유형만 필터링
        const filtered = wageCalculationTypes.filter((wct) => {
            const wctStartDate = new Date(wct.start_date);
            const rangeStartDate = new Date(startDate);
            const rangeEndDate = new Date(endDate);

            // 시작일이 범위 종료일 이전인 경우 포함
            return wctStartDate <= rangeEndDate;
        });

        return filtered.map((wct) => wct.DTO변환한다());
    }

    /**
     * 임금 계산 유형 목록을 조회한다
     */
    async 목록조회한다(manager?: EntityManager): Promise<WageCalculationTypeDTO[]> {
        const repository = this.getRepository(manager);
        const wageCalculationTypes = await repository.find({
            where: { deleted_at: IsNull() },
            order: { start_date: 'DESC' },
        });
        return wageCalculationTypes.map((wct) => wct.DTO변환한다());
    }

    /**
     * 임금 계산 유형을 수정한다
     */
    async 수정한다(
        id: string,
        data: UpdateWageCalculationTypeData,
        userId: string,
        manager?: EntityManager,
    ): Promise<WageCalculationTypeDTO> {
        const repository = this.getRepository(manager);
        const wageCalculationType = await repository.findOne({ where: { id } });
        if (!wageCalculationType) {
            throw new NotFoundException(`임금 계산 유형을 찾을 수 없습니다. (id: ${id})`);
        }

        // 현재 적용 중으로 변경하는 경우, 기존 적용 중인 항목을 비활성화
        if (data.isCurrentlyApplied === true && !wageCalculationType.is_currently_applied) {
            const existingActive = await repository.findOne({
                where: {
                    is_currently_applied: true,
                    deleted_at: IsNull(),
                },
            });

            if (existingActive && existingActive.id !== id) {
                existingActive.업데이트한다(undefined, undefined, undefined, false);
                existingActive.수정자설정한다(userId);
                existingActive.메타데이터업데이트한다(userId);
                await repository.save(existingActive);
            }
        }

        wageCalculationType.업데이트한다(
            data.calculationType,
            data.startDate,
            data.changedAt,
            data.isCurrentlyApplied,
        );

        // 수정자 정보 설정
        wageCalculationType.수정자설정한다(userId);
        wageCalculationType.메타데이터업데이트한다(userId);

        const saved = await repository.save(wageCalculationType);
        return saved.DTO변환한다();
    }

    /**
     * 임금 계산 유형을 삭제한다 (Soft Delete)
     */
    async 삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const wageCalculationType = await repository.findOne({ where: { id } });
        if (!wageCalculationType) {
            throw new NotFoundException(`임금 계산 유형을 찾을 수 없습니다. (id: ${id})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        wageCalculationType.deleted_at = new Date();
        // 삭제자 정보 설정
        wageCalculationType.수정자설정한다(userId);
        wageCalculationType.메타데이터업데이트한다(userId);
        await repository.save(wageCalculationType);
    }

    /**
     * 임금 계산 유형을 완전히 삭제한다 (Hard Delete)
     */
    async 완전삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        // Soft Delete된 임금 계산 유형도 조회할 수 있도록 withDeleted 옵션 사용
        const wageCalculationType = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!wageCalculationType) {
            throw new NotFoundException(`임금 계산 유형을 찾을 수 없습니다. (id: ${id})`);
        }
        // Hard Delete: 데이터베이스에서 완전히 삭제
        await repository.remove(wageCalculationType);
    }
}
