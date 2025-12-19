import { Public } from '../../../../libs/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';

// Business Service
import { NotificationManagementService } from '../notification-management.service';

@ApiTags('v2 알림 ')
@Controller('v1/notifications')
@Public()
export class CronNotificationController {
    constructor(private readonly notificationManagementService: NotificationManagementService) {}

    @ApiExcludeEndpoint()
    @Get('cron-job/send-upcoming-notification')
    async sendUpcomingNotification() {
        return this.notificationManagementService.다가오는_일정의_알림을_전송한다();
    }
}
