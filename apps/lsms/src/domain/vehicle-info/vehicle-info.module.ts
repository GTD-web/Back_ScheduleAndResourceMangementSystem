import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainVehicleInfoService } from './vehicle-info.service';
import { DomainVehicleInfoRepository } from './vehicle-info.repository';
import { VehicleInfo } from './vehicle-info.entity';

@Module({
    imports: [TypeOrmModule.forFeature([VehicleInfo])],
    providers: [DomainVehicleInfoService, DomainVehicleInfoRepository],
    exports: [DomainVehicleInfoService],
})
export class DomainVehicleInfoModule {}
