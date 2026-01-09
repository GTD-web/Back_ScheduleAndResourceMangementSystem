import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainReservationVehicleService } from './reservation-vehicle.service';
import { DomainReservationVehicleRepository } from './reservation-vehicle.repository';
import { ReservationVehicle } from './reservation-vehicle.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ReservationVehicle])],
    providers: [DomainReservationVehicleService, DomainReservationVehicleRepository],
    exports: [DomainReservationVehicleService],
})
export class DomainReservationVehicleModule {}
