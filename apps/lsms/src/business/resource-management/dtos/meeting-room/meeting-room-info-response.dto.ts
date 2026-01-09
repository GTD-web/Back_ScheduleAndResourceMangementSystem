import { ApiProperty } from '@nestjs/swagger';

export class MeetingRoomInfoResponseDto {
    @ApiProperty()
    meetingRoomInfoId: string;

    @ApiProperty()
    resourceId: string;
}
