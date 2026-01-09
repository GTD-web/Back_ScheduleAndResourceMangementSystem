import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateMeetingRoomInfoDto {
    @ApiProperty({
        description: '회의실 ID',
        example: 'meeting-room-123',
    })
    meetingRoomInfoId: string;
}
