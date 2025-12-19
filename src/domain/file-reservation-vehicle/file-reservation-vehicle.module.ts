import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainFileReservationVehicleService } from './file-reservation-vehicle.service';
import { DomainFileReservationVehicleRepository } from './file-reservation-vehicle.repository';
import { FileReservationVehicle } from '../../../libs/entities/file-reservation-vehicle.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FileReservationVehicle])],
    providers: [DomainFileReservationVehicleService, DomainFileReservationVehicleRepository],
    exports: [DomainFileReservationVehicleService],
})
export class DomainFileReservationVehicleModule {}
