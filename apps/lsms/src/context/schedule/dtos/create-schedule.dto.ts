import { ScheduleType } from '../../../../libs/enums/schedule-type.enum';

export interface CreateScheduleDto {
    title: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate: Date;
    notifyBeforeStart?: boolean;
    notifyMinutesBeforeStart?: number[];
    scheduleType: ScheduleType;
    scheduleDepartment?: string;
}

export interface CreateScheduleParticipantDto {
    scheduleId: string;
    employeeId: string;
    type: string;
}

export interface CreateScheduleRelationDto {
    scheduleId: string;
    projectId?: string;
    reservationId?: string;
}
