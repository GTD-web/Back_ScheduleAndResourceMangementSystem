import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleInfo } from './vehicle-info.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainVehicleInfoRepository extends BaseRepository<VehicleInfo> {
    constructor(
        @InjectRepository(VehicleInfo)
        repository: Repository<VehicleInfo>,
    ) {
        super(repository);
    }
}
