import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainReservationParticipantService } from './reservation-participant.service';
import { DomainReservationParticipantRepository } from './reservation-participant.repository';
import { ReservationParticipant } from '../../../libs/entities/reservation-participant.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ReservationParticipant])],
    providers: [DomainReservationParticipantService, DomainReservationParticipantRepository],
    exports: [DomainReservationParticipantService],
})
export class DomainReservationParticipantModule {}
