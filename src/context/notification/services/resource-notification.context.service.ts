import { Injectable, Logger } from '@nestjs/common';
import { NotificationContextService } from './notification.context.service';
import { NotificationType } from '../../../../libs/enums/notification-type.enum';
import { Resource } from '../../../../libs/entities/resource.entity';
import { CreateNotificationDataDto } from '../dtos/create-notification.dto';
import { Consumable } from '../../../../libs/entities/consumable.entity';

@Injectable()
export class ResourceNotificationContextService {
    private readonly logger = new Logger(ResourceNotificationContextService.name);
    constructor(private readonly notificationContextService: NotificationContextService) {}

    async 정비완료_알림을_전송한다(
        data: { resource: Resource; consumable: Consumable },
        targetEmployeeIds: string[],
    ): Promise<void> {
        const notificationData: CreateNotificationDataDto = {
            resource: {
                resourceId: data.resource?.resourceId,
                resourceName: data.resource?.name,
                resourceType: data.resource?.type,
                vehicleInfo: {
                    consumable: {
                        consumableName: data.consumable?.name,
                        consumableId: data.consumable?.consumableId,
                    },
                },
            },
        };

        await this.notificationContextService.알림_전송_프로세스를_진행한다(
            NotificationType.RESOURCE_MAINTENANCE_COMPLETED,
            notificationData,
            targetEmployeeIds,
        );
    }
}
