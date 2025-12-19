import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleRelation } from '../../../libs/entities/schedule-relations.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainScheduleRelationRepository extends BaseRepository<ScheduleRelation> {
    constructor(
        @InjectRepository(ScheduleRelation)
        repository: Repository<ScheduleRelation>,
    ) {
        super(repository);
    }
}
