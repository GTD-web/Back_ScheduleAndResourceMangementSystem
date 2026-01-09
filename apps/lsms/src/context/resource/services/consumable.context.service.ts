import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ERROR_MESSAGE } from '../../../../libs/constants/error-message';

// Domain Services
import { DomainConsumableService } from '../../../domain/consumable/consumable.service';
import { DomainVehicleInfoService } from '../../../domain/vehicle-info/vehicle-info.service';

// DTOs
import { CreateConsumableDto } from '../../../business/resource-management/dtos/vehicle/create-vehicle-info.dto';
import { UpdateConsumableDto } from '../../../business/resource-management/dtos/vehicle/update-vehicle-info.dto';
import { ConsumableResponseDto } from '../../../business/resource-management/dtos/vehicle/vehicle-response.dto';

@Injectable()
export class ConsumableContextService {
    constructor(
        private readonly domainConsumableService: DomainConsumableService,
        private readonly domainVehicleInfoService: DomainVehicleInfoService,
    ) {}

    async 소모품을_저장한다(createConsumableDto: CreateConsumableDto): Promise<ConsumableResponseDto> {
        const vehicleInfo = await this.domainVehicleInfoService.findOne({
            where: {
                vehicleInfoId: createConsumableDto.vehicleInfoId,
            },
            relations: ['consumables'],
        });

        if (!vehicleInfo) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.VEHICLE_INFO.NOT_FOUND);
        }

        createConsumableDto.initMileage = vehicleInfo.totalMileage;

        if (vehicleInfo.consumables.length > 0) {
            const hasSameName = vehicleInfo.consumables.some(
                (consumable) => consumable.name === createConsumableDto.name,
            );
            if (hasSameName) {
                throw new BadRequestException(ERROR_MESSAGE.BUSINESS.CONSUMABLE.ALREADY_EXISTS);
            }
        }

        const savedConsumable = await this.domainConsumableService.save(createConsumableDto);

        return {
            consumableId: savedConsumable.consumableId,
            vehicleInfoId: savedConsumable.vehicleInfoId,
            name: savedConsumable.name,
            replaceCycle: savedConsumable.replaceCycle,
            notifyReplacementCycle: savedConsumable.notifyReplacementCycle,
        };
    }

    async 차량별_소모품목록을_조회한다(vehicleInfoId: string): Promise<ConsumableResponseDto[]> {
        // 차량 정보 조회 (총 주행거리 필요)
        const vehicleInfo = await this.domainVehicleInfoService.findOne({
            where: { vehicleInfoId },
        });

        if (!vehicleInfo) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.VEHICLE_INFO.NOT_FOUND);
        }

        const consumables = await this.domainConsumableService.findAll({
            where: { vehicleInfoId },
            relations: ['maintenances'],
            order: { name: 'ASC' },
        });

        return consumables.map((consumable) => {
            // 교체 필요 여부 계산
            let isReplacementRequired = false;

            if (consumable.maintenances && consumable.maintenances.length > 0) {
                // 가장 최근 정비 이력 찾기 (날짜 기준 내림차순 정렬 후 첫 번째)
                const latestMaintenance = consumable.maintenances.sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
                )[0];

                // 현재 총 주행거리 - 마지막 정비 시 주행거리 > 교체 주기
                const mileageSinceLastMaintenance = vehicleInfo.totalMileage - Number(latestMaintenance.mileage);
                isReplacementRequired = mileageSinceLastMaintenance > consumable.replaceCycle;
            } else {
                // 정비 이력이 없으면 초기 주행거리 기준으로 계산
                // 초기 주행거리가 있다면 사용, 없으면 0으로 처리
                const initMileage = consumable.initMileage || 0;
                const mileageSinceInit = vehicleInfo.totalMileage - initMileage;
                isReplacementRequired = mileageSinceInit > consumable.replaceCycle;
            }

            return {
                consumableId: consumable.consumableId,
                vehicleInfoId: consumable.vehicleInfoId,
                name: consumable.name,
                replaceCycle: consumable.replaceCycle,
                notifyReplacementCycle: consumable.notifyReplacementCycle,
                isReplacementRequired,
                maintenances: consumable.maintenances,
            };
        });
    }

    async 소모품을_조회한다(consumableId: string): Promise<ConsumableResponseDto> {
        const consumable = await this.domainConsumableService.findOne({
            where: { consumableId },
            relations: ['maintenances'],
        });

        if (!consumable) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.CONSUMABLE.NOT_FOUND);
        }

        // 차량 정보 조회 (총 주행거리 필요)
        const vehicleInfo = await this.domainVehicleInfoService.findOne({
            where: { vehicleInfoId: consumable.vehicleInfoId },
        });

        if (!vehicleInfo) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.VEHICLE_INFO.NOT_FOUND);
        }

        // 교체 필요 여부 계산
        let isReplacementRequired = false;

        if (consumable.maintenances && consumable.maintenances.length > 0) {
            // 가장 최근 정비 이력 찾기 (날짜 기준 내림차순 정렬 후 첫 번째)
            const latestMaintenance = consumable.maintenances.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )[0];

            // 현재 총 주행거리 - 마지막 정비 시 주행거리 > 교체 주기
            const mileageSinceLastMaintenance = vehicleInfo.totalMileage - Number(latestMaintenance.mileage);
            isReplacementRequired = mileageSinceLastMaintenance > consumable.replaceCycle;
        } else {
            // 정비 이력이 없으면 초기 주행거리 기준으로 계산
            const initMileage = consumable.initMileage || 0;
            const mileageSinceInit = vehicleInfo.totalMileage - initMileage;
            isReplacementRequired = mileageSinceInit > consumable.replaceCycle;
        }

        return {
            consumableId: consumable.consumableId,
            vehicleInfoId: consumable.vehicleInfoId,
            name: consumable.name,
            replaceCycle: consumable.replaceCycle,
            notifyReplacementCycle: consumable.notifyReplacementCycle,
            isReplacementRequired,
            maintenances: consumable.maintenances,
        };
    }

    async 소모품을_수정한다(
        consumableId: string,
        updateConsumableDto: UpdateConsumableDto,
    ): Promise<ConsumableResponseDto> {
        const existingConsumable = await this.domainConsumableService.findOne({
            where: { consumableId },
        });

        if (!existingConsumable) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.CONSUMABLE.NOT_FOUND);
        }

        // 같은 차량의 다른 소모품과 이름이 중복되는지 확인
        const vehicleConsumables = await this.domainConsumableService.findAll({
            where: { vehicleInfoId: updateConsumableDto.vehicleInfoId },
        });

        const hasSameName = vehicleConsumables.some(
            (consumable) => consumable.name === updateConsumableDto.name && consumable.consumableId !== consumableId,
        );

        if (hasSameName) {
            throw new BadRequestException(ERROR_MESSAGE.BUSINESS.CONSUMABLE.ALREADY_EXISTS);
        }

        await this.domainConsumableService.update(consumableId, updateConsumableDto);

        const updatedConsumable = await this.domainConsumableService.findOne({
            where: { consumableId },
            relations: ['maintenances'],
        });

        // 차량 정보 조회 (총 주행거리 필요)
        const vehicleInfo = await this.domainVehicleInfoService.findOne({
            where: { vehicleInfoId: updatedConsumable.vehicleInfoId },
        });

        if (!vehicleInfo) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.VEHICLE_INFO.NOT_FOUND);
        }

        // 교체 필요 여부 계산
        let isReplacementRequired = false;

        if (updatedConsumable.maintenances && updatedConsumable.maintenances.length > 0) {
            // 가장 최근 정비 이력 찾기 (날짜 기준 내림차순 정렬 후 첫 번째)
            const latestMaintenance = updatedConsumable.maintenances.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )[0];

            // 현재 총 주행거리 - 마지막 정비 시 주행거리 > 교체 주기
            const mileageSinceLastMaintenance = vehicleInfo.totalMileage - Number(latestMaintenance.mileage);
            isReplacementRequired = mileageSinceLastMaintenance > updatedConsumable.replaceCycle;
        } else {
            // 정비 이력이 없으면 초기 주행거리 기준으로 계산
            const initMileage = updatedConsumable.initMileage || 0;
            const mileageSinceInit = vehicleInfo.totalMileage - initMileage;
            isReplacementRequired = mileageSinceInit > updatedConsumable.replaceCycle;
        }

        return {
            consumableId: updatedConsumable.consumableId,
            vehicleInfoId: updatedConsumable.vehicleInfoId,
            name: updatedConsumable.name,
            replaceCycle: updatedConsumable.replaceCycle,
            notifyReplacementCycle: updatedConsumable.notifyReplacementCycle,
            isReplacementRequired,
            maintenances: updatedConsumable.maintenances,
        };
    }

    async 소모품을_삭제한다(consumableId: string): Promise<void> {
        const consumable = await this.domainConsumableService.findOne({
            where: { consumableId },
            relations: ['maintenances'],
        });

        if (!consumable) {
            throw new NotFoundException(ERROR_MESSAGE.BUSINESS.CONSUMABLE.NOT_FOUND);
        }

        // 정비 이력이 있는 경우 삭제 불가
        if (consumable.maintenances && consumable.maintenances.length > 0) {
            throw new BadRequestException('정비 이력이 있는 소모품은 삭제할 수 없습니다.');
        }

        await this.domainConsumableService.delete(consumableId);
    }

    /**
     * 소모품의 교체 필요 여부를 계산한다
     */
    async 소모품_교체필요여부를_계산한다(consumable: any, totalMileage: number): Promise<boolean> {
        if (consumable.maintenances && consumable.maintenances.length > 0) {
            // 가장 최근 정비 이력 찾기 (날짜 기준 내림차순 정렬 후 첫 번째)
            const latestMaintenance = consumable.maintenances.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )[0];

            // 현재 총 주행거리 - 마지막 정비 시 주행거리 > 교체 주기
            const mileageSinceLastMaintenance = totalMileage - Number(latestMaintenance.mileage);
            return mileageSinceLastMaintenance > consumable.replaceCycle;
        } else {
            // 정비 이력이 없으면 초기 주행거리 기준으로 계산
            const initMileage = consumable.initMileage || 0;
            const mileageSinceInit = totalMileage - initMileage;
            return mileageSinceInit > consumable.replaceCycle;
        }
    }

    /**
     * 차량의 모든 소모품에 대해 교체 필요 여부를 계산한다
     */
    async 차량_소모품들의_교체필요여부를_계산한다(vehicleInfo: any): Promise<
        Array<{
            consumable: any;
            isReplacementRequired: boolean;
        }>
    > {
        const results = [];

        for (const consumable of vehicleInfo?.consumables || []) {
            const isReplacementRequired = await this.소모품_교체필요여부를_계산한다(
                consumable,
                vehicleInfo.totalMileage,
            );

            results.push({
                consumable,
                isReplacementRequired,
            });
        }

        return results;
    }
}
