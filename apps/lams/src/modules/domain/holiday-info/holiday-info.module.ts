import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainHolidayInfoService } from './holiday-info.service';
import { DomainHolidayInfoRepository } from './holiday-info.repository';
import { HolidayInfo } from './holiday-info.entity';

@Module({
    imports: [TypeOrmModule.forFeature([HolidayInfo])],
    providers: [DomainHolidayInfoService, DomainHolidayInfoRepository],
    exports: [DomainHolidayInfoService, DomainHolidayInfoRepository],
})
export class DomainHolidayInfoModule {}
