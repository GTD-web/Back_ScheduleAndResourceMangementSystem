import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainMeetingRoomInfoRepository } from './meeting-room-info.repository';
import { BaseService } from '../../../libs/services/base.service';
import { MeetingRoomInfo } from '../../../libs/entities/meeting-room-info.entity';
import { IRepositoryOptions } from '../../../libs/interfaces/repository.interface';

@Injectable()
export class DomainMeetingRoomInfoService extends BaseService<MeetingRoomInfo> {
    constructor(private readonly meetingRoomInfoRepository: DomainMeetingRoomInfoRepository) {
        super(meetingRoomInfoRepository);
    }

    async findByMeetingRoomInfoId(meetingRoomInfoId: string): Promise<MeetingRoomInfo> {
        const meetingRoomInfo = await this.meetingRoomInfoRepository.findOne({
            where: { meetingRoomInfoId },
        });
        if (!meetingRoomInfo) {
            throw new NotFoundException('회의실 정보를 찾을 수 없습니다.');
        }
        return meetingRoomInfo;
    }

    async findByResourceId(resourceId: string): Promise<MeetingRoomInfo> {
        const meetingRoomInfo = await this.meetingRoomInfoRepository.findOne({
            where: { resourceId },
        });
        if (!meetingRoomInfo) {
            throw new NotFoundException('회의실 정보를 찾을 수 없습니다.');
        }
        return meetingRoomInfo;
    }
}
