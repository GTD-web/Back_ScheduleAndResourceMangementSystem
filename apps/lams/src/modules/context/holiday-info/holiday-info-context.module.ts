import { Module } from '@nestjs/common';
import { HolidayInfoContext } from './holiday-info.context';
import { DomainHolidayInfoModule } from '../../domain/holiday-info/holiday-info.module';

@Module({
    imports: [DomainHolidayInfoModule],
    providers: [HolidayInfoContext],
    exports: [HolidayInfoContext],
})
export class HolidayInfoContextModule {}
