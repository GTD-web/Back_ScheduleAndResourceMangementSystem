import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainConsumableRepository } from './consumable.repository';
import { BaseService } from '../../../libs/services/base.service';
import { Consumable } from './consumable.entity';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';

@Injectable()
export class DomainConsumableService extends BaseService<Consumable> {
    constructor(private readonly consumableRepository: DomainConsumableRepository) {
        super(consumableRepository);
    }

    async findOneByConsumableId(consumableId: string): Promise<Consumable> {
        const consumable = await this.consumableRepository.findOne({
            where: { consumableId },
        });
        return consumable;
    }

    async findAllByVehicleInfoId(vehicleInfoId: string): Promise<Consumable[]> {
        return this.consumableRepository.findAll({
            where: { vehicleInfoId },
        });
    }

    async bulkCreate(consumables: Consumable[], repositoryOptions?: IRepositoryOptions<Consumable>) {
        return this.consumableRepository.bulkCreate(consumables, repositoryOptions);
    }
}
