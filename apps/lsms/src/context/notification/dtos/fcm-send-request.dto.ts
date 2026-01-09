import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class FcmSendRequestDto {
    @ApiProperty({
        description: 'FCM 토큰 (단일 전송)',
        example:
            'cwqfAzkLLfdrrG0XK6RPVn:APA91bHYIqESrcbAk5uvCYwqkSQo6wU-kEb4DRTO4wAM7da2SrL4zdntAmgWxGoXA33K2X8NJW0MzVC-iyevf7PNdEajFG3a-0OnaVVsV5pjNAPUgiyztK4',
        required: false,
    })
    @IsOptional()
    @IsString()
    token?: string;

    @ApiProperty({
        description: 'FCM 토큰 배열 (다중 전송)',
        example: ['token1', 'token2', 'token3'],
        required: false,
        isArray: true,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tokens?: string[];

    @ApiProperty({
        description: '알림 제목',
        example: '회의일정 알림',
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: '알림 내용',
        example: '현재 브라우저로 테스트 전송합니다.',
    })
    @IsString()
    body: string;

    @ApiProperty({
        description: '클릭 시 이동할 링크',
        example: '/plan/user/schedule-add',
    })
    @IsString()
    link: string;

    @ApiProperty({
        description: '알림 아이콘 URL',
        example: 'https://lumir-erp.vercel.app/%EC%82%BC%EC%A1%B1%EC%98%A4_black.png',
    })
    @IsString()
    icon: string;
}
