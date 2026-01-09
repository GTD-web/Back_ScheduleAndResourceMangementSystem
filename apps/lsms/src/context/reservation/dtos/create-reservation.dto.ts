import { ReservationStatus } from '../../../../libs/enums/reservation-type.enum';
import { ResourceType } from '../../../../libs/enums/resource-type.enum';

export interface CreateReservationDto {
    title: string;
    description?: string;
    resourceId: string;
    resourceType: ResourceType;
    status: ReservationStatus;
    startDate: Date;
    endDate: Date;
}
