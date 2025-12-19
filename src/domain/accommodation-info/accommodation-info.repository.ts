import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccommodationInfo } from '../../../libs/entities/accommodation-info.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainAccommodationInfoRepository extends BaseRepository<AccommodationInfo> {
    constructor(
        @InjectRepository(AccommodationInfo)
        repository: Repository<AccommodationInfo>,
    ) {
        super(repository);
    }
}
