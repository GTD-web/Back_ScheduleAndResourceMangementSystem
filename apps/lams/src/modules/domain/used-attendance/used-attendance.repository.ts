import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsedAttendance } from './used-attendance.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class DomainUsedAttendanceRepository extends BaseRepository<UsedAttendance> {
    constructor(
        @InjectRepository(UsedAttendance)
        repository: Repository<UsedAttendance>,
    ) {
        super(repository);
    }
}

