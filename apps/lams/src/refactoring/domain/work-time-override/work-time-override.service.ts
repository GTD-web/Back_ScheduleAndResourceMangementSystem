import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Repository } from 'typeorm';
import { WorkTimeOverride } from './work-time-override.entity';
import {
    CreateWorkTimeOverrideData,
    UpdateWorkTimeOverrideData,
    WorkTimeOverrideDTO,
} from './work-time-override.types';

/**
 * 근무시간 커스터마이징 서비스
 *
 * 근무시간 커스터마이징 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainWorkTimeOverrideService {
    constructor(
        @InjectRepository(WorkTimeOverride)
        private readonly repository: Repository<WorkTimeOverride>,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<WorkTimeOverride> {
        return manager ? manager.getRepository(WorkTimeOverride) : this.repository;
    }

    /**
     * 근무시간 커스터마이징을 생성한다
     */
    async 생성한다(
        data: CreateWorkTimeOverrideData,
        userId: string,
        manager?: EntityManager,
    ): Promise<WorkTimeOverrideDTO> {
        const repository = this.getRepository(manager);

        const workTimeOverride = new WorkTimeOverride(data.date, data.startWorkTime, data.endWorkTime, data.reason);
        workTimeOverride.생성자설정한다(userId);
        workTimeOverride.메타데이터업데이트한다(userId);

        const saved = await repository.save(workTimeOverride);
        return saved.DTO변환한다();
    }

    /**
     * ID로 근무시간 커스터마이징을 조회한다
     */
    async ID로조회한다(id: string): Promise<WorkTimeOverrideDTO> {
        const workTimeOverride = await this.repository.findOne({ where: { id } });
        if (!workTimeOverride) {
            throw new NotFoundException(`근무시간 커스터마이징을 찾을 수 없습니다. (id: ${id})`);
        }
        return workTimeOverride.DTO변환한다();
    }

    /**
     * 날짜로 근무시간 커스터마이징을 조회한다
     */
    async 날짜로조회한다(date: string, manager?: EntityManager): Promise<WorkTimeOverrideDTO | null> {
        const repository = this.getRepository(manager);
        const workTimeOverride = await repository.findOne({
            where: { date, deleted_at: IsNull() },
        });
        return workTimeOverride ? workTimeOverride.DTO변환한다() : null;
    }

    /**
     * 날짜 목록으로 근무시간 커스터마이징을 일괄 조회한다
     *
     * 성능 최적화를 위해 여러 날짜를 한 번에 조회합니다.
     */
    async 날짜목록으로조회한다(dates: string[], manager?: EntityManager): Promise<Map<string, WorkTimeOverrideDTO>> {
        if (dates.length === 0) {
            return new Map();
        }

        const repository = this.getRepository(manager);
        const workTimeOverrides = await repository.find({
            where: { date: In(dates), deleted_at: IsNull() },
        });

        const result = new Map<string, WorkTimeOverrideDTO>();
        workTimeOverrides.forEach((override) => {
            result.set(override.date, override.DTO변환한다());
        });

        return result;
    }

    /**
     * 근무시간 커스터마이징 목록을 조회한다
     */
    async 목록조회한다(manager?: EntityManager): Promise<WorkTimeOverrideDTO[]> {
        const repository = this.getRepository(manager);
        const workTimeOverrides = await repository.find({
            where: { deleted_at: IsNull() },
            order: { date: 'ASC' },
        });
        return workTimeOverrides.map((wto) => wto.DTO변환한다());
    }

    /**
     * 근무시간 커스터마이징을 수정한다
     */
    async 수정한다(
        id: string,
        data: UpdateWorkTimeOverrideData,
        userId: string,
        manager?: EntityManager,
    ): Promise<WorkTimeOverrideDTO> {
        const repository = this.getRepository(manager);
        const workTimeOverride = await repository.findOne({ where: { id } });
        if (!workTimeOverride) {
            throw new NotFoundException(`근무시간 커스터마이징을 찾을 수 없습니다. (id: ${id})`);
        }

        workTimeOverride.업데이트한다(data.startWorkTime, data.endWorkTime, data.reason);

        // 수정자 정보 설정
        workTimeOverride.수정자설정한다(userId);
        workTimeOverride.메타데이터업데이트한다(userId);

        const saved = await repository.save(workTimeOverride);
        return saved.DTO변환한다();
    }

    /**
     * 날짜로 근무시간 커스터마이징을 수정한다
     */
    async 날짜로수정한다(
        date: string,
        data: UpdateWorkTimeOverrideData,
        userId: string,
        manager?: EntityManager,
    ): Promise<WorkTimeOverrideDTO> {
        const repository = this.getRepository(manager);
        const workTimeOverride = await repository.findOne({
            where: { date, deleted_at: IsNull() },
        });
        if (!workTimeOverride) {
            throw new NotFoundException(`근무시간 커스터마이징을 찾을 수 없습니다. (date: ${date})`);
        }

        workTimeOverride.업데이트한다(data.startWorkTime, data.endWorkTime, data.reason);

        // 수정자 정보 설정
        workTimeOverride.수정자설정한다(userId);
        workTimeOverride.메타데이터업데이트한다(userId);

        const saved = await repository.save(workTimeOverride);
        return saved.DTO변환한다();
    }

    /**
     * 근무시간 커스터마이징을 삭제한다 (Soft Delete)
     */
    async 삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const workTimeOverride = await repository.findOne({ where: { id } });
        if (!workTimeOverride) {
            throw new NotFoundException(`근무시간 커스터마이징을 찾을 수 없습니다. (id: ${id})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        workTimeOverride.deleted_at = new Date();
        // 삭제자 정보 설정
        workTimeOverride.수정자설정한다(userId);
        workTimeOverride.메타데이터업데이트한다(userId);
        await repository.save(workTimeOverride);
    }

    /**
     * 날짜로 근무시간 커스터마이징을 삭제한다 (Soft Delete)
     */
    async 날짜로삭제한다(date: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const workTimeOverride = await repository.findOne({
            where: { date, deleted_at: IsNull() },
        });
        if (!workTimeOverride) {
            throw new NotFoundException(`근무시간 커스터마이징을 찾을 수 없습니다. (date: ${date})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        workTimeOverride.deleted_at = new Date();
        // 삭제자 정보 설정
        workTimeOverride.수정자설정한다(userId);
        workTimeOverride.메타데이터업데이트한다(userId);
        await repository.save(workTimeOverride);
    }

    /**
     * 근무시간 커스터마이징을 완전히 삭제한다 (Hard Delete)
     */
    async 완전삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        // Soft Delete된 근무시간 커스터마이징도 조회할 수 있도록 withDeleted 옵션 사용
        const workTimeOverride = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!workTimeOverride) {
            throw new NotFoundException(`근무시간 커스터마이징을 찾을 수 없습니다. (id: ${id})`);
        }
        // Hard Delete: 데이터베이스에서 완전히 삭제
        await repository.remove(workTimeOverride);
    }
}
