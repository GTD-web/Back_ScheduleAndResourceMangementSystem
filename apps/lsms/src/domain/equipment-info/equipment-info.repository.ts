import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentInfo } from './equipment-info.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainEquipmentInfoRepository extends BaseRepository<EquipmentInfo> {
    constructor(
        @InjectRepository(EquipmentInfo)
        repository: Repository<EquipmentInfo>,
    ) {
        super(repository);
    }
}
