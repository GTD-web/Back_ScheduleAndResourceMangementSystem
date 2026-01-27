import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { WorkScheduleType } from './work-schedule-type.entity';
import {
    CreateWorkScheduleTypeData,
    UpdateWorkScheduleTypeData,
    WorkScheduleTypeDTO,
    ScheduleType,
} from './work-schedule-type.types';

/**
 * 근무 유형 서비스
 *
 * 전사적으로 적용되는 고정근무/유연근무 상태를 기간별로 관리합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainWorkScheduleTypeService {
    constructor(
        @InjectRepository(WorkScheduleType)
        private readonly repository: Repository<WorkScheduleType>,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<WorkScheduleType> {
        return manager ? manager.getRepository(WorkScheduleType) : this.repository;
    }

    /**
     * 근무 유형을 생성한다
     *
     * 새로운 근무 유형을 추가할 때, 기존에 적용 중인 근무 유형이 있으면
     * 해당 근무 유형의 종료일을 자동으로 설정합니다.
     */
    async 생성한다(
        data: CreateWorkScheduleTypeData,
        userId: string,
        manager?: EntityManager,
    ): Promise<WorkScheduleTypeDTO> {
        const repository = this.getRepository(manager);

        // 1. 기존에 적용 중인 근무 유형이 있는지 확인 (end_date가 null이거나 start_date가 새로운 start_date 이후인 경우)
        const existingActive = await repository.findOne({
            where: {
                deleted_at: IsNull(),
            },
            order: { start_date: 'DESC' },
        });

        // 2. 기존 적용 중인 근무 유형이 있고, 새로운 시작일이 기존 기간과 겹치는 경우
        if (existingActive) {
            const existingStartDate = new Date(existingActive.start_date);
            const existingEndDate = existingActive.end_date ? new Date(existingActive.end_date) : null;
            const newStartDate = new Date(data.startDate);

            // 기존 근무 유형이 아직 종료되지 않았고, 새로운 시작일이 기존 기간 내에 있는 경우
            if (!existingEndDate || newStartDate < existingEndDate) {
                // 기존 근무 유형의 종료일을 새로운 시작일 하루 전으로 설정
                const previousEndDate = new Date(newStartDate);
                previousEndDate.setDate(previousEndDate.getDate() - 1);
                const previousEndDateStr = previousEndDate.toISOString().split('T')[0];

                existingActive.업데이트한다(
                    undefined,
                    undefined,
                    previousEndDateStr,
                    undefined,
                );
                existingActive.수정자설정한다(userId);
                existingActive.메타데이터업데이트한다(userId);
                await repository.save(existingActive);
            }
        }

        // 3. 새로운 근무 유형 생성
        const workScheduleType = new WorkScheduleType(
            data.scheduleType,
            data.startDate,
            data.endDate,
            data.reason,
        );
        workScheduleType.생성자설정한다(userId);
        workScheduleType.메타데이터업데이트한다(userId);

        const saved = await repository.save(workScheduleType);
        return saved.DTO변환한다();
    }

    /**
     * ID로 근무 유형을 조회한다
     */
    async ID로조회한다(id: string, manager?: EntityManager): Promise<WorkScheduleTypeDTO> {
        const repository = this.getRepository(manager);
        const workScheduleType = await repository.findOne({ where: { id } });
        if (!workScheduleType) {
            throw new NotFoundException(`근무 유형을 찾을 수 없습니다. (id: ${id})`);
        }
        return workScheduleType.DTO변환한다();
    }

    /**
     * 특정 날짜에 적용되는 근무 유형을 조회한다
     *
     * @param date 조회할 날짜 (yyyy-MM-dd 형식)
     * @param manager 트랜잭션 매니저 (선택)
     * @returns 해당 날짜에 적용되는 근무 유형, 없으면 null
     */
    async 날짜로조회한다(
        date: string,
        manager?: EntityManager,
    ): Promise<WorkScheduleTypeDTO | null> {
        const repository = this.getRepository(manager);
        const workScheduleType = await repository.findOne({
            where: {
                start_date: LessThanOrEqual(date),
                deleted_at: IsNull(),
            },
            order: { start_date: 'DESC' },
        });

        if (!workScheduleType) {
            return null;
        }

        // end_date가 null이거나 조회 날짜보다 이후인 경우에만 적용됨
        if (workScheduleType.end_date && workScheduleType.end_date < date) {
            return null;
        }

        return workScheduleType.DTO변환한다();
    }

    /**
     * 현재 적용 중인 근무 유형을 조회한다
     *
     * @param manager 트랜잭션 매니저 (선택)
     * @returns 현재 적용 중인 근무 유형, 없으면 null
     */
    async 현재적용중조회한다(manager?: EntityManager): Promise<WorkScheduleTypeDTO | null> {
        const today = new Date().toISOString().split('T')[0];
        return this.날짜로조회한다(today, manager);
    }

    /**
     * 기간 범위로 근무 유형 목록을 조회한다
     *
     * @param startDate 시작일 (yyyy-MM-dd 형식)
     * @param endDate 종료일 (yyyy-MM-dd 형식)
     * @param manager 트랜잭션 매니저 (선택)
     * @returns 해당 기간에 적용되는 근무 유형 목록
     */
    async 기간범위로조회한다(
        startDate: string,
        endDate: string,
        manager?: EntityManager,
    ): Promise<WorkScheduleTypeDTO[]> {
        const repository = this.getRepository(manager);
        const workScheduleTypes = await repository.find({
            where: {
                deleted_at: IsNull(),
            },
            order: { start_date: 'ASC' },
        });

        // 기간 범위와 겹치는 근무 유형만 필터링
        const filtered = workScheduleTypes.filter((wst) => {
            const wstStartDate = new Date(wst.start_date);
            const wstEndDate = wst.end_date ? new Date(wst.end_date) : null;
            const rangeStartDate = new Date(startDate);
            const rangeEndDate = new Date(endDate);

            // 근무 유형의 시작일이 범위 종료일 이전이고,
            // 근무 유형의 종료일이 null이거나 범위 시작일 이후인 경우
            return (
                wstStartDate <= rangeEndDate &&
                (!wstEndDate || wstEndDate >= rangeStartDate)
            );
        });

        return filtered.map((wst) => wst.DTO변환한다());
    }

    /**
     * 근무 유형 목록을 조회한다
     */
    async 목록조회한다(manager?: EntityManager): Promise<WorkScheduleTypeDTO[]> {
        const repository = this.getRepository(manager);
        const workScheduleTypes = await repository.find({
            where: { deleted_at: IsNull() },
            order: { start_date: 'DESC' },
        });
        return workScheduleTypes.map((wst) => wst.DTO변환한다());
    }

    /**
     * 근무 유형을 수정한다
     */
    async 수정한다(
        id: string,
        data: UpdateWorkScheduleTypeData,
        userId: string,
        manager?: EntityManager,
    ): Promise<WorkScheduleTypeDTO> {
        const repository = this.getRepository(manager);
        const workScheduleType = await repository.findOne({ where: { id } });
        if (!workScheduleType) {
            throw new NotFoundException(`근무 유형을 찾을 수 없습니다. (id: ${id})`);
        }

        workScheduleType.업데이트한다(
            data.scheduleType,
            data.startDate,
            data.endDate,
            data.reason,
        );

        // 수정자 정보 설정
        workScheduleType.수정자설정한다(userId);
        workScheduleType.메타데이터업데이트한다(userId);

        const saved = await repository.save(workScheduleType);
        return saved.DTO변환한다();
    }

    /**
     * 근무 유형을 삭제한다 (Soft Delete)
     */
    async 삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const workScheduleType = await repository.findOne({ where: { id } });
        if (!workScheduleType) {
            throw new NotFoundException(`근무 유형을 찾을 수 없습니다. (id: ${id})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        workScheduleType.deleted_at = new Date();
        // 삭제자 정보 설정
        workScheduleType.수정자설정한다(userId);
        workScheduleType.메타데이터업데이트한다(userId);
        await repository.save(workScheduleType);
    }

    /**
     * 근무 유형을 완전히 삭제한다 (Hard Delete)
     */
    async 완전삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        // Soft Delete된 근무 유형도 조회할 수 있도록 withDeleted 옵션 사용
        const workScheduleType = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!workScheduleType) {
            throw new NotFoundException(`근무 유형을 찾을 수 없습니다. (id: ${id})`);
        }
        // Hard Delete: 데이터베이스에서 완전히 삭제
        await repository.remove(workScheduleType);
    }
}
