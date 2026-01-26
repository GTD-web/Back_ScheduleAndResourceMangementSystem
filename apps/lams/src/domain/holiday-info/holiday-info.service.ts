import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { HolidayInfo } from './holiday-info.entity';
import { CreateHolidayInfoData, UpdateHolidayInfoData, HolidayInfoDTO } from './holiday-info.types';

/**
 * 휴일 정보 서비스
 *
 * 휴일 정보 엔티티에 대한 CRUD 기능을 제공합니다.
 * 상위 로직에서 제공하는 트랜잭션(EntityManager)을 받아서 사용할 수 있습니다.
 */
@Injectable()
export class DomainHolidayInfoService {
    constructor(
        @InjectRepository(HolidayInfo)
        private readonly repository: Repository<HolidayInfo>,
    ) {}

    /**
     * Repository를 가져온다 (트랜잭션 지원)
     */
    private getRepository(manager?: EntityManager): Repository<HolidayInfo> {
        return manager ? manager.getRepository(HolidayInfo) : this.repository;
    }

    /**
     * 휴일 정보를 생성한다
     */
    async 생성한다(data: CreateHolidayInfoData, manager?: EntityManager): Promise<HolidayInfoDTO> {
        const repository = this.getRepository(manager);

        const holidayInfo = new HolidayInfo(data.holidayName, data.holidayDate);

        const saved = await repository.save(holidayInfo);
        return saved.DTO변환한다();
    }

    /**
     * ID로 휴일 정보를 조회한다
     */
    async ID로조회한다(id: string): Promise<HolidayInfoDTO> {
        const holidayInfo = await this.repository.findOne({ where: { id } });
        if (!holidayInfo) {
            throw new NotFoundException(`휴일 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        return holidayInfo.DTO변환한다();
    }

    /**
     * 휴일 정보 목록을 조회한다
     */
    async 목록조회한다(): Promise<HolidayInfoDTO[]> {
        const holidayInfos = await this.repository.find({
            where: { deleted_at: IsNull() },
            order: { holiday_date: 'ASC' },
        });
        return holidayInfos.map((hi) => hi.DTO변환한다());
    }

    /**
     * 휴일 정보를 수정한다
     */
    async 수정한다(
        id: string,
        data: UpdateHolidayInfoData,
        userId: string,
        manager?: EntityManager,
    ): Promise<HolidayInfoDTO> {
        const repository = this.getRepository(manager);
        const holidayInfo = await repository.findOne({ where: { id } });
        if (!holidayInfo) {
            throw new NotFoundException(`휴일 정보를 찾을 수 없습니다. (id: ${id})`);
        }

        holidayInfo.업데이트한다(data.holidayName, data.holidayDate);

        // 수정자 정보 설정
        holidayInfo.수정자설정한다(userId);
        holidayInfo.메타데이터업데이트한다(userId);

        const saved = await repository.save(holidayInfo);
        return saved.DTO변환한다();
    }

    /**
     * 휴일 정보를 삭제한다 (Soft Delete)
     */
    async 삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        const holidayInfo = await repository.findOne({ where: { id } });
        if (!holidayInfo) {
            throw new NotFoundException(`휴일 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        // Soft Delete: deleted_at 필드를 설정
        holidayInfo.deleted_at = new Date();
        // 삭제자 정보 설정
        holidayInfo.수정자설정한다(userId);
        holidayInfo.메타데이터업데이트한다(userId);
        await repository.save(holidayInfo);
    }

    /**
     * 휴일 정보를 완전히 삭제한다 (Hard Delete)
     */
    async 완전삭제한다(id: string, userId: string, manager?: EntityManager): Promise<void> {
        const repository = this.getRepository(manager);
        // Soft Delete된 휴일 정보도 조회할 수 있도록 withDeleted 옵션 사용
        const holidayInfo = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!holidayInfo) {
            throw new NotFoundException(`휴일 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        // Hard Delete: 데이터베이스에서 완전히 삭제
        await repository.remove(holidayInfo);
    }
}
