import { Injectable } from '@nestjs/common';
import { DomainHolidayInfoRepository } from './holiday-info.repository';
import { BaseService } from '../../../common/services/base.service';
import { HolidayInfo } from './holiday-info.entity';

@Injectable()
export class DomainHolidayInfoService extends BaseService<HolidayInfo> {
    constructor(private readonly holidayInfoRepository: DomainHolidayInfoRepository) {
        super(holidayInfoRepository);
    }
}
