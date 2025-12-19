import { Injectable } from '@nestjs/common';
import { DomainReservationRepository } from './reservation.repository';
import { BaseService } from '../../../libs/services/base.service';
import { Reservation } from '../../../libs/entities/reservation.entity';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';
import { DeepPartial, In, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Not } from 'typeorm';
import { ReservationStatus } from '../../../libs/enums/reservation-type.enum';
import { ResourceType } from '../../../libs/enums/resource-type.enum';
import { DateUtil } from '../../../libs/utils/date.util';

@Injectable()
export class DomainReservationService extends BaseService<Reservation> {
    constructor(private readonly reservationRepository: DomainReservationRepository) {
        super(reservationRepository);
    }

    async save(entity: DeepPartial<Reservation>, options?: IRepositoryOptions<Reservation>): Promise<Reservation> {
        const reservation = entity as Reservation;
        if (reservation.endDate) {
            // endDate의 시간이 15시(UTC)인 경우 (KST 00:00:00), 1초를 빼서 전날로 유지
            if (
                reservation.endDate.getUTCHours() === 15 &&
                reservation.endDate.getUTCMinutes() === 0 &&
                reservation.endDate.getUTCSeconds() === 0
            ) {
                reservation.endDate.setSeconds(reservation.endDate.getSeconds() - 1);
            }
        }
        return this.reservationRepository.save(entity, options);
    }

    async update(
        entityId: string,
        entity: Partial<Reservation>,
        options?: IRepositoryOptions<Reservation>,
    ): Promise<Reservation> {
        const reservation = entity as Reservation;
        if (reservation.endDate) {
            // endDate의 시간이 15시(UTC)인 경우 (KST 00:00:00), 1초를 빼서 전날로 유지
            if (
                reservation.endDate.getUTCHours() === 15 &&
                reservation.endDate.getUTCMinutes() === 0 &&
                reservation.endDate.getUTCSeconds() === 0
            ) {
                reservation.endDate.setSeconds(reservation.endDate.getSeconds() - 1);
            }
        }
        return this.reservationRepository.update(entityId, entity, options);
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
