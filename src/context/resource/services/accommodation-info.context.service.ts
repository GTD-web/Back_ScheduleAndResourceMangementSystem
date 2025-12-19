import { Injectable } from '@nestjs/common';
import { DomainAccommodationInfoService } from '../../../domain/accommodation-info/accommodation-info.service';

@Injectable()
export class AccommodationInfoContextService {
    constructor(private readonly domainAccommodationInfoService: DomainAccommodationInfoService) {}

    /**
     * resourceId로 숙소 정보만 조회
     */
    async 숙소정보만_조회한다(resourceId: string) {
        const accommodationInfo = await this.domainAccommodationInfoService.findOne({
            where: { resourceId },
        });
        return accommodationInfo;
    }
}
