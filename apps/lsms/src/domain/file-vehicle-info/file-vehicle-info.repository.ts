import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileVehicleInfo } from './file-vehicle-info.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainFileVehicleInfoRepository extends BaseRepository<FileVehicleInfo> {
    constructor(
        @InjectRepository(FileVehicleInfo)
        repository: Repository<FileVehicleInfo>,
    ) {
        super(repository);
    }
}
