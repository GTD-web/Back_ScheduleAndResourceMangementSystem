import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainReservationService } from './reservation.service';
import { DomainReservationRepository } from './reservation.repository';
import { Reservation } from './reservation.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Reservation])],
    providers: [DomainReservationService, DomainReservationRepository],
    exports: [DomainReservationService],
})
export class DomainReservationModule {}
