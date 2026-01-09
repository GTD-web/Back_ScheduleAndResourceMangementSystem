import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileReservationVehicle } from './file-reservation-vehicle.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainFileReservationVehicleRepository extends BaseRepository<FileReservationVehicle> {
    constructor(
        @InjectRepository(FileReservationVehicle)
        repository: Repository<FileReservationVehicle>,
    ) {
        super(repository);
    }
}
