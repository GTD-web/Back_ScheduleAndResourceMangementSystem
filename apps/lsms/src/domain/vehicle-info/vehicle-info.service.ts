import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainVehicleInfoRepository } from './vehicle-info.repository';
import { BaseService } from '../../../libs/services/base.service';
import { VehicleInfo } from './vehicle-info.entity';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';

@Injectable()
export class DomainVehicleInfoService extends BaseService<VehicleInfo> {
    constructor(private readonly vehicleInfoRepository: DomainVehicleInfoRepository) {
        super(vehicleInfoRepository);
    }

    async findByVehicleInfoId(vehicleInfoId: string): Promise<VehicleInfo> {
        const vehicleInfo = await this.vehicleInfoRepository.findOne({
            where: { vehicleInfoId },
        });
        if (!vehicleInfo) {
            throw new NotFoundException('차량 정보를 찾을 수 없습니다.');
        }
        return vehicleInfo;
    }

    async findByResourceId(resourceId: string): Promise<VehicleInfo> {
        const vehicleInfo = await this.vehicleInfoRepository.findOne({
            where: { resourceId },
        });
        if (!vehicleInfo) {
            throw new NotFoundException('차량 정보를 찾을 수 없습니다.');
        }
        return vehicleInfo;
    }
}
