import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingRoomInfo } from '../../../libs/entities/meeting-room-info.entity';
import { BaseRepository } from '../../../libs/repositories/base.repository';

@Injectable()
export class DomainMeetingRoomInfoRepository extends BaseRepository<MeetingRoomInfo> {
    constructor(
        @InjectRepository(MeetingRoomInfo)
        repository: Repository<MeetingRoomInfo>,
    ) {
        super(repository);
    }
}
