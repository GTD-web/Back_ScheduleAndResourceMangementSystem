import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainEquipmentInfoRepository } from './equipment-info.repository';
import { BaseService } from '../../../libs/services/base.service';
import { EquipmentInfo } from './equipment-info.entity';

@Injectable()
export class DomainEquipmentInfoService extends BaseService<EquipmentInfo> {
    constructor(private readonly equipmentInfoRepository: DomainEquipmentInfoRepository) {
        super(equipmentInfoRepository);
    }
}
