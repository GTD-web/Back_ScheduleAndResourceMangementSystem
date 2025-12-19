import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeNotification } from '../../../libs/entities/employee-notification.entity';
import { DomainEmployeeNotificationService } from './employee-notification.service';
import { DomainEmployeeNotificationRepository } from './employee-notification.repository';

@Module({
    imports: [TypeOrmModule.forFeature([EmployeeNotification])],
    providers: [DomainEmployeeNotificationService, DomainEmployeeNotificationRepository],
    exports: [DomainEmployeeNotificationService],
})
export class DomainEmployeeNotificationModule {}
