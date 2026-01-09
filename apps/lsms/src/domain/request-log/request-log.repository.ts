import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../libs/repositories/base.repository';
import { RequestLog } from './request-log.entity';

@Injectable()
export class DomainRequestLogRepository extends BaseRepository<RequestLog> {
    constructor(
        @InjectRepository(RequestLog)
        repository: Repository<RequestLog>,
    ) {
        super(repository);
    }
}
