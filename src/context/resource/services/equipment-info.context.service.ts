import { Injectable } from '@nestjs/common';
import { DomainEquipmentInfoService } from '../../../domain/equipment-info/equipment-info.service';

@Injectable()
export class EquipmentInfoContextService {
    constructor(private readonly domainEquipmentInfoService: DomainEquipmentInfoService) {}

    /**
     * resourceId로 장비 정보만 조회
     */
    async 장비정보만_조회한다(resourceId: string) {
        const equipmentInfo = await this.domainEquipmentInfoService.findOne({
            where: { resourceId },
        });
        return equipmentInfo;
    }
}
