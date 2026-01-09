import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RecipientDto {
    @ApiProperty({
        description: '수신자 사용자 ID (사번)',
        example: 'user1',
    })
    @IsNotEmpty()
    @IsString()
    employeeNumber: string;

    @ApiProperty({
        description: '수신자 FCM 토큰 목록 (한 사용자가 여러 기기를 가질 수 있음)',
        example: ['token1', 'token2'],
        type: [String],
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    tokens: string[];
}

export class SendPortalNotificationDto {
    @ApiPropertyOptional({
        description: '발신자 ID (사번)',
        example: 'user001',
    })
    @IsOptional()
    @IsString()
    sender?: string;

    @ApiProperty({
        description: '알림 제목',
        example: '새로운 공지사항이 등록되었습니다',
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        description: '알림 내용',
        example: '인사팀에서 새로운 공지사항을 등록했습니다.',
    })
    @IsNotEmpty()
    @IsString()
    content: string;

    @ApiProperty({
        description: '수신자 목록',
        example: [
            { employeeNumber: 'user1', tokens: ['token1', 'token2'] },
            { employeeNumber: 'user2', tokens: ['token3'] },
            { employeeNumber: 'user3', tokens: ['token4', 'token5', 'token6'] },
        ],
        type: [RecipientDto],
    })
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecipientDto)
    recipients: RecipientDto[];

    @ApiPropertyOptional({
        description: '소스 시스템',
        example: 'portal',
        default: 'portal',
    })
    @IsOptional()
    @IsString()
    sourceSystem?: string;

    @ApiPropertyOptional({
        description: '연결할 URL',
        example: '/portal/announcements/123',
    })
    @IsOptional()
    @IsString()
    linkUrl?: string;

    @ApiPropertyOptional({
        description: '메타데이터 (추가 정보)',
        example: { type: 'announcement', priority: 'high' },
    })
    @IsOptional()
    metadata?: Record<string, any>;
}

export class PortalNotificationResponseDto {
    @ApiProperty({
        description: '전송 성공 여부',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: '결과 메시지',
        example: '포털 알림 전송 완료',
    })
    message: string;

    @ApiPropertyOptional({
        description: '전송된 알림 ID',
        example: 'notification-123',
    })
    notificationId?: string;

    @ApiPropertyOptional({
        description: '에러 메시지',
        example: '알림 전송 실패',
    })
    error?: string;
}
