import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleParticipant } from '../../../libs/entities/schedule-participant.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainScheduleParticipantRepository extends BaseRepository<ScheduleParticipant> {
    constructor(
        @InjectRepository(ScheduleParticipant)
        repository: Repository<ScheduleParticipant>,
    ) {
        super(repository);
    }
}
