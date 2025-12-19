import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { PaginationMetaDto, ResponseNotificationDto } from '../../../business.dto.index';

/**
 * 알림 목록 응답 DTO
 * PaginationData<ResponseNotificationDto>의 구체적 구현
 */
export class NotificationListResponseDto {
    @ApiProperty({
        description: '알림 목록',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                notificationId: {
                    type: 'string',
                    description: '알림 ID',
                    example: 'notification-uuid-123',
                },
                title: {
                    type: 'string',
                    description: '알림 제목',
                    example: '[예약 확정] 회의실 A 예약',
                },
                body: {
                    type: 'string',
                    description: '알림 내용',
                    example: '2024-01-15 09:00 ~ 10:00',
                },
                notificationType: {
                    type: 'string',
                    description: '알림 타입',
                    example: 'RESERVATION_STATUS_CONFIRMED',
                },
                notificationData: {
                    type: 'object',
                    description: '알림 관련 상세 데이터',
                },
                createdAt: {
                    type: 'string',
                    description: '생성 시간',
                    example: '2024-01-01T00:00:00.000Z',
                },
                isRead: {
                    type: 'boolean',
                    description: '읽음 여부',
                    example: false,
                },
            },
        },
    })
    @ValidateNested({ each: true })
    @Type(() => ResponseNotificationDto)
    items: ResponseNotificationDto[];

    @ApiProperty({
        description: '페이지네이션 메타데이터',
        type: PaginationMetaDto,
        example: {
            total: 50,
            page: 1,
            limit: 20,
            hasNext: true,
        },
    })
    @ValidateNested()
    @Type(() => PaginationMetaDto)
    meta: PaginationMetaDto;
}
