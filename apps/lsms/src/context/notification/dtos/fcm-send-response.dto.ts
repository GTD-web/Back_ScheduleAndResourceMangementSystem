import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FcmSendResponseDto {
    @ApiProperty({
        description: '전송 성공 여부',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: '전송 메시지',
        example: 'FCM 알림이 성공적으로 전송되었습니다.',
    })
    message: string;

    @ApiPropertyOptional({
        description: '메시지 ID (성공 시)',
        example: 'projects/myproject-b5ae1/messages/0:1234567890123456%31bd1c9931bd1c99',
    })
    messageId?: string;

    @ApiPropertyOptional({
        description: '에러 코드 (실패 시)',
        example: 'messaging/invalid-registration-token',
    })
    errorCode?: string;

    @ApiPropertyOptional({
        description: '에러 메시지 (실패 시)',
        example: 'The registration token is not a valid FCM registration token',
    })
    errorMessage?: string;
}

export class FcmBulkSendResponseDto {
    @ApiProperty({
        description: '전체 전송 성공 여부',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: '전송 메시지',
        example: 'FCM 벌크 알림이 전송되었습니다.',
    })
    message: string;

    @ApiProperty({
        description: '성공한 전송 수',
        example: 5,
    })
    successCount: number;

    @ApiProperty({
        description: '실패한 전송 수',
        example: 1,
    })
    failureCount: number;

    @ApiPropertyOptional({
        description: '개별 전송 결과',
        type: [FcmSendResponseDto],
    })
    results?: FcmSendResponseDto[];

    @ApiPropertyOptional({
        description: '에러 코드 (실패 시)',
        example: 'messaging/invalid-registration-token',
    })
    errorCode?: string;

    @ApiPropertyOptional({
        description: '에러 메시지 (실패 시)',
        example: 'The registration token is not a valid FCM registration token',
    })
    errorMessage?: string;

    @ApiPropertyOptional({
        description: '메시지 ID (성공 시)',
        example: 'projects/myproject-b5ae1/messages/0:1234567890123456%31bd1c9931bd1c99',
    })
    messageId?: string;
}
