import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyEventSummary } from './daily-event-summary.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class DomainDailyEventSummaryRepository extends BaseRepository<DailyEventSummary> {
    constructor(
        @InjectRepository(DailyEventSummary)
        repository: Repository<DailyEventSummary>,
    ) {
        super(repository);
    }
}

