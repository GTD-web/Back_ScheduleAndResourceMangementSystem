import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationTypeEntity } from '../../../libs/entities/notification-type.entity';
import { NotificationType } from '../../../libs/enums/notification-type.enum';

/**
 * 알림 타입 도메인 서비스
 *
 * NotificationTypeEntity에 대한 CRUD 작업을 처리합니다.
 * - 알림 타입별 설정 조회
 * - 템플릿 및 요구사항 정보 제공
 * - 도메인 레벨의 순수한 데이터 액세스 담당
 */
@Injectable()
export class DomainNotificationTypeService {
    constructor(
        @InjectRepository(NotificationTypeEntity)
        private readonly notificationTypeRepository: Repository<NotificationTypeEntity>,
    ) {}

    /**
     * 모든 알림 타입 설정을 조회한다
     */
    async findAll(): Promise<NotificationTypeEntity[]> {
        return await this.notificationTypeRepository.find();
    }

    /**
     * 특정 알림 타입의 설정을 조회한다
     */
    async findByType(notificationType: NotificationType): Promise<NotificationTypeEntity | null> {
        return await this.notificationTypeRepository.findOne({
            where: { notificationType },
        });
    }

    /**
     * 알림 타입 설정을 생성한다
     */
    async create(notificationTypeEntity: Partial<NotificationTypeEntity>): Promise<NotificationTypeEntity> {
        const entity = this.notificationTypeRepository.create(notificationTypeEntity);
        return await this.notificationTypeRepository.save(entity);
    }

    /**
     * 알림 타입 설정을 수정한다
     */
    async update(
        notificationType: NotificationType,
        updateData: Partial<NotificationTypeEntity>,
    ): Promise<NotificationTypeEntity> {
        await this.notificationTypeRepository.update({ notificationType }, updateData);
        return await this.findByType(notificationType);
    }

    /**
     * 알림 타입 설정을 삭제한다
     */
    async delete(notificationType: NotificationType): Promise<void> {
        await this.notificationTypeRepository.delete({ notificationType });
    }

    /**
     * 알림 타입별 템플릿 정보를 조회한다 (캐시 가능한 메서드)
     */
    async findTemplateByType(notificationType: NotificationType): Promise<{
        defaultTitleTemplate: string;
        defaultBodyTemplate: string;
        description?: string;
    } | null> {
        const result = await this.notificationTypeRepository.findOne({
            where: { notificationType },
            select: ['defaultTitleTemplate', 'defaultBodyTemplate', 'description'],
        });

        return result || null;
    }

    /**
     * 알림 타입별 요구사항을 조회한다
     */
    async findRequirementsByType(notificationType: NotificationType): Promise<any | null> {
        const result = await this.notificationTypeRepository.findOne({
            where: { notificationType },
            select: ['requirements'],
        });

        return result?.requirements || null;
    }
}
