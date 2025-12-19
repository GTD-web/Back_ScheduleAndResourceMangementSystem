import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../../../../libs/enums/notification-type.enum';
import { Type } from 'class-transformer';
import { IsString, IsOptional, ValidateNested, IsBoolean, IsEnum } from 'class-validator';

// 공통 DTO들을 create-notification.dto.ts에서 가져와서 response용 alias로 사용
import {
    NotificationResourceDto,
    NotificationReservationDto,
    NotificationScheduleDto,
    NotificationProjectDto,
} from './create-notification.dto';

export class NotificationDataDto {
    @ApiPropertyOptional({
        type: NotificationScheduleDto,
        description: '일정 관련 정보',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => NotificationScheduleDto)
    schedule?: NotificationScheduleDto;

    @ApiPropertyOptional({
        type: NotificationReservationDto,
        description: '예약 관련 정보',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => NotificationReservationDto)
    reservation?: NotificationReservationDto;

    @ApiPropertyOptional({
        type: NotificationResourceDto,
        description: '자원 관련 정보',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => NotificationResourceDto)
    resource?: NotificationResourceDto;

    @ApiPropertyOptional({
        type: NotificationProjectDto,
        description: '프로젝트 관련 정보',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => NotificationProjectDto)
    project?: NotificationProjectDto;
}

export class ResponseNotificationDto {
    @ApiProperty({ description: '알림 ID' })
    @IsString()
    notificationId: string;

    @ApiProperty({ description: '알림 제목' })
    @IsString()
    title: string;

    @ApiProperty({ description: '알림 내용' })
    @IsString()
    body: string;

    @ApiProperty({
        type: NotificationDataDto,
        description: '알림 데이터 (타입별 정보)',
    })
    @ValidateNested()
    @Type(() => NotificationDataDto)
    notificationData: NotificationDataDto;

    @ApiProperty({ description: '생성 시간' })
    @IsString()
    createdAt: string;

    @ApiProperty({
        enum: NotificationType,
        description: '알림 타입',
        example: NotificationType.RESERVATION_STATUS_CONFIRMED,
    })
    @IsEnum(NotificationType)
    notificationType: NotificationType;

    @ApiPropertyOptional({ description: '읽음 여부', default: false })
    @IsOptional()
    @IsBoolean()
    isRead?: boolean;
}

export class PushNotificationSendResult {
    @ApiProperty({ description: '전송 성공 여부' })
    @IsBoolean()
    success: boolean;

    @ApiProperty({ description: '응답 메시지' })
    message: any;

    @ApiPropertyOptional({ description: '에러 메시지 (실패시)' })
    @IsOptional()
    @IsString()
    error?: string;
}
