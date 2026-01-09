import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeNotification } from './employee-notification.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainEmployeeNotificationRepository extends BaseRepository<EmployeeNotification> {
    constructor(
        @InjectRepository(EmployeeNotification)
        repository: Repository<EmployeeNotification>,
    ) {
        super(repository);
    }

    async deleteByNotificationId(notificationId: string): Promise<void> {
        await this.repository.delete({ notificationId });
    }
}
