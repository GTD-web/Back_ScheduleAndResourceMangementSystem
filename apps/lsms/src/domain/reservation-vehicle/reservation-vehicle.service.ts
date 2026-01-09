import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainReservationVehicleRepository } from './reservation-vehicle.repository';
import { BaseService } from '../../../libs/services/base.service';
import { ReservationVehicle } from './reservation-vehicle.entity';

@Injectable()
export class DomainReservationVehicleService extends BaseService<ReservationVehicle> {
    constructor(private readonly reservationVehicleRepository: DomainReservationVehicleRepository) {
        super(reservationVehicleRepository);
    }

    async findByReservationVehicleId(reservationVehicleId: string): Promise<ReservationVehicle> {
        const reservationVehicle = await this.reservationVehicleRepository.findOne({
            where: { reservationVehicleId },
        });
        return reservationVehicle;
    }

    async findByReservationId(reservationId: string): Promise<ReservationVehicle[]> {
        return this.reservationVehicleRepository.findAll({
            where: { reservationId },
            relations: ['reservation', 'vehicleInfo'],
        });
    }

    async findByVehicleInfoId(vehicleInfoId: string): Promise<ReservationVehicle[]> {
        return this.reservationVehicleRepository.findAll({
            where: { vehicleInfoId },
            relations: ['reservation', 'vehicleInfo'],
        });
    }

    async findByIsReturned(isReturned: boolean): Promise<ReservationVehicle[]> {
        return this.reservationVehicleRepository.findAll({
            where: { isReturned },
            relations: ['reservation', 'vehicleInfo'],
        });
    }
}
