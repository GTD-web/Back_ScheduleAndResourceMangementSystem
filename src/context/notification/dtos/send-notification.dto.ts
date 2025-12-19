import { ApiProperty } from '@nestjs/swagger';
import { PushSubscriptionDto } from './push-subscription.dto';
import { NotificationData } from '../../../../libs/entities/notification.entity';
import { NotificationType } from '../../../../libs/enums/notification-type.enum';

export class PushNotificationPayload {
    @ApiProperty()
    title: string;

    @ApiProperty()
    body: string;

    @ApiProperty()
    notificationType: NotificationType;

    @ApiProperty()
    notificationData: NotificationData;
}

export class PushNotificationDto {
    @ApiProperty({ type: PushNotificationPayload })
    payload: PushNotificationPayload;

    @ApiProperty({ type: PushSubscriptionDto })
    subscription: PushSubscriptionDto;
}
