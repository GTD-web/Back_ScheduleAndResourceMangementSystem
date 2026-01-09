import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { EventInfo } from './event-info.entity';
import { CreateEventInfoData, UpdateEventInfoData, EventInfoDTO } from './event-info.types';

/**
 * 이벤트 정보 서비스
 *
 * 이벤트 정보 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainEventInfoService {
    constructor(
        @InjectRepository(EventInfo)
        private readonly repository: Repository<EventInfo>,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<EventInfo> {
        return manager ? manager.getRepository(EventInfo) : this.repository;
    }

    /**
     * 이벤트 정보를 생성한다
     */
    async 생성한다(data: CreateEventInfoData, manager?: EntityManager): Promise<EventInfoDTO> {
        const repository = this.getRepository(manager);

        const eventInfo = new EventInfo(
            data.employeeName,
            data.eventTime,
            data.yyyymmdd,
            data.hhmmss,
            data.employeeNumber,
        );

        const saved = await repository.save(eventInfo);
        return saved.DTO변환한다();
    }

    /**
     * ID로 이벤트 정보를 조회한다
     */
    async ID로조회한다(id: string): Promise<EventInfoDTO> {
        const eventInfo = await this.repository.findOne({ where: { id } });
        if (!eventInfo) {
            throw new NotFoundException(`이벤트 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        return eventInfo.DTO변환한다();
    }

    /**
     * 이벤트 정보 목록을 조회한다
     */
    async 목록조회한다(): Promise<EventInfoDTO[]> {
        const eventInfos = await this.repository.find({
            where: { deleted_at: IsNull() },
            order: { event_time: 'DESC' },
        });
        return eventInfos.map((ei) => ei.DTO변환한다());
    }

    /**
     * 이벤트 정보를 수정한다
     */
    async 수정한다(
        id: string,
        data: UpdateEventInfoData,
        userId: string,
        manager?: EntityManager,
    ): Promise<EventInfoDTO> {
        const repository = this.getRepository(manager);
        const eventInfo = await repository.findOne({ where: { id } });
        if (!eventInfo) {
            throw new NotFoundException(`이벤트 정보를 찾을 수 없습니다. (id: ${id})`);
        }

        eventInfo.업데이트한다(data.employeeName, data.employeeNumber, data.eventTime, data.yyyymmdd, data.hhmmss);

        // 수정자 정보 설정
        eventInfo.수정자설정한다(userId);
        eventInfo.메타데이터업데이트한다(userId);

        const saved = await repository.save(eventInfo);
        return saved.DTO변환한다();
    }

    /**
     * 이벤트 정보를 삭제한다 (Soft Delete)
     */
    async 삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const eventInfo = await repository.findOne({ where: { id } });
        if (!eventInfo) {
            throw new NotFoundException(`이벤트 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        eventInfo.deleted_at = new Date();
        // 삭제자 정보 설정
        eventInfo.수정자설정한다(userId);
        eventInfo.메타데이터업데이트한다(userId);
        await repository.save(eventInfo);
    }

    /**
     * 이벤트 정보를 완전히 삭제한다 (Hard Delete)
     */
    async 완전삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        // Soft Delete된 이벤트 정보도 조회할 수 있도록 withDeleted 옵션 사용
        const eventInfo = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!eventInfo) {
            throw new NotFoundException(`이벤트 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        // Hard Delete: 데이터베이스에서 완전히 삭제
        await repository.remove(eventInfo);
    }
}
