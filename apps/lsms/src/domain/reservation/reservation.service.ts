import { Injectable } from '@nestjs/common';
import { DomainReservationRepository } from './reservation.repository';
import { BaseService } from '../../../libs/services/base.service';
import { Reservation } from './reservation.entity';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';
import { In, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Not } from 'typeorm';
import { ReservationStatus } from '../../../libs/enums/reservation-type.enum';
import { ResourceType } from '../../../libs/enums/resource-type.enum';
import { DateUtil } from '../../../libs/utils/date.util';

@Injectable()
export class DomainReservationService extends BaseService<Reservation> {
    constructor(private readonly reservationRepository: DomainReservationRepository) {
        super(reservationRepository);
    }

    async findByReservationId(reservationId: string): Promise<Reservation> {
        return this.reservationRepository.findOne({
            where: { reservationId },
        });
    }

    async findByReservationIds(reservationIds: string[]): Promise<Reservation[]> {
        return this.reservationRepository.findAll({
            where: { reservationId: In(reservationIds) },
            relations: ['resource'],
        });
    }

    async findByResourceIds(resourceIds: string[]): Promise<Reservation[]> {
        return this.reservationRepository.findAll({
            where: { resourceId: In(resourceIds) },
            relations: ['resource'],
        });
    }

    async findByResourceIdsAndDateRange(resourceIds: string[], startDate: Date, endDate: Date): Promise<Reservation[]> {
        return this.reservationRepository.findAll({
            where: {
                resource: { resourceId: In(resourceIds) },
                startDate: LessThanOrEqual(endDate),
                endDate: MoreThanOrEqual(startDate),
            },
        });
    }

    async checkReservationConflicts(
        resourceId: string,
        startDate: Date,
        endDate: Date,
        reservationId?: string,
    ): Promise<boolean> {
        const conflicts = await this.reservationRepository.findAll({
            where: {
                resourceId,
                status: Not(In([ReservationStatus.CANCELLED, ReservationStatus.REJECTED])),
                startDate: LessThan(endDate),
                endDate: MoreThan(startDate),
                ...(reservationId && { reservationId: Not(reservationId) }),
            },
        });

        return conflicts.length === 0;
    }
}
