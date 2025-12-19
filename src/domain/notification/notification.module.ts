import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../../libs/entities/notification.entity';
import { DomainNotificationService } from './notification.service';
import { DomainNotificationRepository } from './notification.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Notification])],
    providers: [DomainNotificationService, DomainNotificationRepository],
    exports: [DomainNotificationService, DomainNotificationRepository],
})
export class DomainNotificationModule {}
