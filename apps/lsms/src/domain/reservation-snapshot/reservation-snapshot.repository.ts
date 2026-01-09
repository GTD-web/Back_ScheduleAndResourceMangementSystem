import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationSnapshot } from './reservation-snapshot.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainReservationSnapshotRepository extends BaseRepository<ReservationSnapshot> {
    constructor(
        @InjectRepository(ReservationSnapshot)
        repository: Repository<ReservationSnapshot>,
    ) {
        super(repository);
    }
}
