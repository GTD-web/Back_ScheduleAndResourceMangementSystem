import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainMeetingRoomInfoService } from './meeting-room-info.service';
import { DomainMeetingRoomInfoRepository } from './meeting-room-info.repository';
import { MeetingRoomInfo } from './meeting-room-info.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MeetingRoomInfo])],
    providers: [DomainMeetingRoomInfoService, DomainMeetingRoomInfoRepository],
    exports: [DomainMeetingRoomInfoService],
})
export class DomainMeetingRoomInfoModule {}
