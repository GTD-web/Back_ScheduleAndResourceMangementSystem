import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceType } from './attendance-type.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class DomainAttendanceTypeRepository extends BaseRepository<AttendanceType> {
    constructor(
        @InjectRepository(AttendanceType)
        repository: Repository<AttendanceType>,
    ) {
        super(repository);
    }
}

