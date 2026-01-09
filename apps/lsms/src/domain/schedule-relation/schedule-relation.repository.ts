import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleRelation } from './schedule-relation.entity';
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
