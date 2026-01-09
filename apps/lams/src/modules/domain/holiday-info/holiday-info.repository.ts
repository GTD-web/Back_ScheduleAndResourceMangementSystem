import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HolidayInfo } from './holiday-info.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class DomainHolidayInfoRepository extends BaseRepository<HolidayInfo> {
    constructor(
        @InjectRepository(HolidayInfo)
        repository: Repository<HolidayInfo>,
    ) {
        super(repository);
    }
}

