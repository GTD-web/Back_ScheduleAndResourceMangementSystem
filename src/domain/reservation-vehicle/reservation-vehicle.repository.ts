import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationVehicle } from '../../../libs/entities/reservation-vehicle.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainReservationVehicleRepository extends BaseRepository<ReservationVehicle> {
    constructor(
        @InjectRepository(ReservationVehicle)
        repository: Repository<ReservationVehicle>,
    ) {
        super(repository);
    }
}
