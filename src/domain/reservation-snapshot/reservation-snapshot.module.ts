import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainReservationSnapshotService } from './reservation-snapshot.service';
import { DomainReservationSnapshotRepository } from './reservation-snapshot.repository';
import { ReservationSnapshot } from '../../../libs/entities/reservation-snapshot.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ReservationSnapshot])],
    providers: [DomainReservationSnapshotService, DomainReservationSnapshotRepository],
    exports: [DomainReservationSnapshotService],
})
export class DomainReservationSnapshotModule {}
