import { Injectable } from '@nestjs/common';
import { DomainMeetingRoomInfoService } from '../../../domain/meeting-room-info/meeting-room-info.service';

@Injectable()
export class MeetingRoomInfoContextService {
    constructor(private readonly domainMeetingRoomInfoService: DomainMeetingRoomInfoService) {}

    /**
     * resourceId로 회의실 정보만 조회
     */
    async 회의실정보만_조회한다(resourceId: string) {
        const meetingRoomInfo = await this.domainMeetingRoomInfoService.findOne({
            where: { resourceId },
        });
        return meetingRoomInfo;
    }
}
