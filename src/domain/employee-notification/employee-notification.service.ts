import { Injectable, NotFoundException } from '@nestjs/common';
import { EmployeeNotification } from '../../../libs/entities/employee-notification.entity';
import { BaseService } from '../../../libs/services/base.service';
import { DomainEmployeeNotificationRepository } from './employee-notification.repository';

@Injectable()
export class DomainEmployeeNotificationService extends BaseService<EmployeeNotification> {
    constructor(private readonly employeeNotificationRepository: DomainEmployeeNotificationRepository) {
        super(employeeNotificationRepository);
    }

    async findByEmployeeId(employeeId: string): Promise<EmployeeNotification[]> {
        return await this.employeeNotificationRepository.findAll({
            where: { employeeId },
            relations: ['notification'],
            order: { notification: { createdAt: 'DESC' } },
        });
    }

    async markAsRead(employeeNotificationId: string): Promise<EmployeeNotification> {
        const notification = await this.findOne({ where: { employeeNotificationId } });
        if (!notification) {
            throw new NotFoundException('알림을 찾을 수 없습니다.');
        }
        return await this.update(employeeNotificationId, { isRead: true });
    }

    async deleteByNotificationId(notificationId: string): Promise<void> {
        await this.employeeNotificationRepository.deleteByNotificationId(notificationId);
    }
}
