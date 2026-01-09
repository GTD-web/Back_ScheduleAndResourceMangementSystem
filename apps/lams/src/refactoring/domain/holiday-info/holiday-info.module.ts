import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HolidayInfo } from './holiday-info.entity';
import { DomainHolidayInfoService } from './holiday-info.service';

/**
 * 휴일 정보 모듈
 */
@Module({
    imports: [TypeOrmModule.forFeature([HolidayInfo])],
    providers: [DomainHolidayInfoService],
    exports: [DomainHolidayInfoService, TypeOrmModule],
})
export class DomainHolidayInfoModule {}
