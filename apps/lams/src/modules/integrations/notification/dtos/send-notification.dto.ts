import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsArray,
    IsOptional,
    IsObject,
    ArrayMaxSize,
    ArrayMinSize,
    IsNotEmpty,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 수신자 DTO
 */
export class RecipientDto {
    @ApiProperty({
        description: '수신자 사용자 ID (사번)',
        example: 'E2023001',
    })
    @IsNotEmpty()
    @IsString()
    employeeNumber: string;

    @ApiProperty({
        description: '수신자 FCM 토큰 목록 (한 사용자가 여러 기기를 가질 수 있음)',
        example: ['fcm_token_1', 'fcm_token_2'],
        type: [String],
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    tokens: string[];
}

/**
 * 알림 전송 요청 DTO
 */
export class SendNotificationDto {
    @ApiPropertyOptional({
        description: '발신자 ID (사번) - 시스템에서 보내는 경우 생략 가능',
        example: 'E2023001',
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
        description: '수신자 목록, 최대 500명',
        example: [
            { employeeNumber: 'E2023002', tokens: ['token1', 'token2'] },
            { employeeNumber: 'E2023003', tokens: ['token3'] },
            { employeeNumber: 'E2023004', tokens: ['token4', 'token5'] },
        ],
        type: [RecipientDto],
    })
    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(500)
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
        description: '알림 클릭 시 이동할 URL',
        example: '/portal/announcements/123',
    })
    @IsOptional()
    @IsString()
    linkUrl?: string;

    @ApiPropertyOptional({
        description: '추가 메타데이터 (JSON)',
        example: { type: 'announcement', priority: 'high' },
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

/**
 * 알림 전송 응답 DTO
 */
export class SendNotificationResponseDto {
    @ApiProperty({
        description: '성공 여부',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: '응답 메시지',
        example: '알림 전송 완료: 성공 3건, 실패 0건',
    })
    message: string;

    @ApiProperty({
        description: '생성된 알림 ID 목록',
        example: ['22e6acc2-03be-4d69-a691-1b5c4e15e119', '33f7bdd3-14cf-5d7a-b802-2c6d5f26f22a'],
        type: [String],
    })
    notificationIds: string[];

    @ApiProperty({
        description: '성공 건수',
        example: 3,
    })
    successCount: number;

    @ApiProperty({
        description: '실패 건수',
        example: 0,
    })
    failureCount: number;
}
