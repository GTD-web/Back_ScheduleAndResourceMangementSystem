import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainReservationSnapshotRepository } from './reservation-snapshot.repository';
import { BaseService } from '../../../libs/services/base.service';
import { ReservationSnapshot } from './reservation-snapshot.entity';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';

@Injectable()
export class DomainReservationSnapshotService extends BaseService<ReservationSnapshot> {
    constructor(private readonly reservationSnapshotRepository: DomainReservationSnapshotRepository) {
        super(reservationSnapshotRepository);
    }
}
