import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainAccommodationInfoService } from './accommodation-info.service';
import { DomainAccommodationInfoRepository } from './accommodation-info.repository';
import { AccommodationInfo } from '../../../libs/entities/accommodation-info.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AccommodationInfo])],
    providers: [DomainAccommodationInfoService, DomainAccommodationInfoRepository],
    exports: [DomainAccommodationInfoService],
})
export class DomainAccommodationInfoModule {}
