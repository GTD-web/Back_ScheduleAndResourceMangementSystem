import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainScheduleRelationRepository } from './schedule-relation.repository';
import { BaseService } from '../../../libs/services/base.service';
import { ScheduleRelation } from './schedule-relation.entity';
import { In, IsNull, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';

@Injectable()
export class DomainScheduleRelationService extends BaseService<ScheduleRelation> {
    constructor(private readonly scheduleRelationRepository: DomainScheduleRelationRepository) {
        super(scheduleRelationRepository);
    }

    async findByScheduleId(scheduleId: string): Promise<ScheduleRelation> {
        return this.scheduleRelationRepository.findOne({
            where: { scheduleId },
        });
    }

    async findByScheduleIds(scheduleIds: string[]): Promise<ScheduleRelation[]> {
        return this.scheduleRelationRepository.findAll({
            where: { scheduleId: In(scheduleIds) },
        });
    }

    async findByScheduleIdsWithRelations(
        scheduleIds: string[],
        options: {
            withSchedule?: boolean;
            withReservation?: boolean;
            withResource?: boolean;
        } = {},
    ): Promise<ScheduleRelation[]> {
        const relations: string[] = [];

        if (options.withSchedule) {
            relations.push('schedule');
        }
        if (options.withReservation) {
            relations.push('reservation');
        }
        if (options.withResource && options.withReservation) {
            relations.push('reservation.resource');
        }

        return this.scheduleRelationRepository.findAll({
            where: { scheduleId: In(scheduleIds) },
            relations,
        });
    }

    async findByReservationIds(reservationIds: string[]): Promise<ScheduleRelation[]> {
        return this.scheduleRelationRepository.findAll({
            where: {
                reservationId: In(reservationIds),
                schedule: {
                    deletedAt: IsNull(),
                },
            },
            withDeleted: true,
        });
    }
}
