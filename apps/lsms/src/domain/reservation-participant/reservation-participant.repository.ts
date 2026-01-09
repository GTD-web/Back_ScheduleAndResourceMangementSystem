import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationParticipant } from './reservation-participant.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainReservationParticipantRepository extends BaseRepository<ReservationParticipant> {
    constructor(
        @InjectRepository(ReservationParticipant)
        repository: Repository<ReservationParticipant>,
    ) {
        super(repository);
    }
}
