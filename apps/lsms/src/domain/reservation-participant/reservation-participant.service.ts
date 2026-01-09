import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainReservationParticipantRepository } from './reservation-participant.repository';
import { BaseService } from '../../../libs/services/base.service';
import { ReservationParticipant } from './reservation-participant.entity';
import { ParticipantsType } from '../../../libs/enums/reservation-type.enum';

@Injectable()
export class DomainReservationParticipantService extends BaseService<ReservationParticipant> {
    constructor(private readonly reservationParticipantRepository: DomainReservationParticipantRepository) {
        super(reservationParticipantRepository);
    }

    async findByParticipantId(participantId: string): Promise<ReservationParticipant> {
        const participant = await this.reservationParticipantRepository.findOne({
            where: { participantId },
            relations: ['reservation', 'employee'],
        });
        if (!participant) {
            throw new NotFoundException('참�??��? 찾을 ???�습?�다.');
        }
        return participant;
    }

    async findByReservationId(reservationId: string): Promise<ReservationParticipant[]> {
        return this.reservationParticipantRepository.findAll({
            where: { reservationId },
            relations: ['reservation', 'employee'],
        });
    }

    async findByEmployeeId(employeeId: string): Promise<ReservationParticipant[]> {
        return this.reservationParticipantRepository.findAll({
            where: { employeeId },
            relations: ['reservation', 'employee'],
        });
    }

    async findByType(type: ParticipantsType): Promise<ReservationParticipant[]> {
        return this.reservationParticipantRepository.findAll({
            where: { type },
            relations: ['reservation', 'employee'],
        });
    }
}
