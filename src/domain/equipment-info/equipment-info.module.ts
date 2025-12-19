import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainEquipmentInfoService } from './equipment-info.service';
import { DomainEquipmentInfoRepository } from './equipment-info.repository';
import { EquipmentInfo } from '../../../libs/entities/equipment-info.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EquipmentInfo])],
    providers: [DomainEquipmentInfoService, DomainEquipmentInfoRepository],
    exports: [DomainEquipmentInfoService],
})
export class DomainEquipmentInfoModule {}
