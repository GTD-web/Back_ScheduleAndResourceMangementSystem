import { Injectable } from '@nestjs/common';
import { DomainAttendanceTypeRepository } from './attendance-type.repository';
import { BaseService } from '../../../common/services/base.service';
import { AttendanceType } from './attendance-type.entity';

@Injectable()
export class DomainAttendanceTypeService extends BaseService<AttendanceType> {
    constructor(private readonly attendanceTypeRepository: DomainAttendanceTypeRepository) {
        super(attendanceTypeRepository);
    }
}

