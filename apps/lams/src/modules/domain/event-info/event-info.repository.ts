import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventInfo } from './event-info.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class DomainEventInfoRepository extends BaseRepository<EventInfo> {
    constructor(
        @InjectRepository(EventInfo)
        repository: Repository<EventInfo>,
    ) {
        super(repository);
    }
}

