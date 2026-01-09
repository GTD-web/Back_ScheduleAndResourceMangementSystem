import { ApiProperty } from '@nestjs/swagger';

export class FCMDto {
    @ApiProperty()
    token: string;
}

export class PushSubscriptionDto {
    @ApiProperty({ type: FCMDto, required: false })
    fcm: FCMDto;
}
