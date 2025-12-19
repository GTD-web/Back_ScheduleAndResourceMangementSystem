import { Module } from '@nestjs/common';
import { TaskController } from './controllers/task.controller';
import { TaskManagementService } from './task-management.service';
import { ResourceContextModule } from '../../context/resource/resource.context.module';
import { ReservationContextModule } from '../../context/reservation/reservation.context.module';
import { NotificationContextModule } from '../../context/notification/notification.context.module';
import { ScheduleContextModule } from '../../context/schedule/schedule.context.module';

@Module({
    imports: [ResourceContextModule, ReservationContextModule, NotificationContextModule, ScheduleContextModule],
    controllers: [TaskController],
    providers: [TaskManagementService],
    exports: [TaskManagementService],
})
export class TaskManagementModule {}
