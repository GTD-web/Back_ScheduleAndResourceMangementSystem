import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateNotificationSettingsDto {
    @ApiProperty({
        description: '웹푸시 알림 설정 여부',
        default: true,
    })
    @IsBoolean()
    isPushNotificationEnabled: boolean;
}
