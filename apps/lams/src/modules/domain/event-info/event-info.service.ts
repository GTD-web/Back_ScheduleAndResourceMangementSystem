import { Injectable } from '@nestjs/common';
import { DomainEventInfoRepository } from './event-info.repository';
import { BaseService } from '../../../common/services/base.service';
import { EventInfo } from './event-info.entity';

@Injectable()
export class DomainEventInfoService extends BaseService<EventInfo> {
    constructor(private readonly eventInfoRepository: DomainEventInfoRepository) {
        super(eventInfoRepository);
    }
}

