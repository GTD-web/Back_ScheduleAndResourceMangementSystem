import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainFileVehicleInfoService } from './file-vehicle-info.service';
import { DomainFileVehicleInfoRepository } from './file-vehicle-info.repository';
import { FileVehicleInfo } from '../../../libs/entities/file-vehicle-info.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FileVehicleInfo])],
    providers: [DomainFileVehicleInfoService, DomainFileVehicleInfoRepository],
    exports: [DomainFileVehicleInfoService],
})
export class DomainFileVehicleInfoModule {}
