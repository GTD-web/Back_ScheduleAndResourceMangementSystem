import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainAccommodationInfoRepository } from './accommodation-info.repository';
import { BaseService } from '../../../libs/services/base.service';
import { AccommodationInfo } from '../../../libs/entities/accommodation-info.entity';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';

@Injectable()
export class DomainAccommodationInfoService extends BaseService<AccommodationInfo> {
    constructor(private readonly accommodationInfoRepository: DomainAccommodationInfoRepository) {
        super(accommodationInfoRepository);
    }

    async findByAccommodationInfoId(accommodationInfoId: string): Promise<AccommodationInfo> {
        const accommodationInfo = await this.accommodationInfoRepository.findOne({
            where: { accommodationInfoId },
        });
        if (!accommodationInfo) {
            throw new NotFoundException('숙소 정보를 찾을 수 없습니다.');
        }
        return accommodationInfo;
    }

    async findByResourceId(resourceId: string): Promise<AccommodationInfo> {
        const accommodationInfo = await this.accommodationInfoRepository.findOne({
            where: { resourceId },
            relations: ['resource'],
        });
        if (!accommodationInfo) {
            throw new NotFoundException('숙소 정보를 찾을 수 없습니다.');
        }
        return accommodationInfo;
    }
}
