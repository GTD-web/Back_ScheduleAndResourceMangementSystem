import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 기본 응답 DTO
export class BaseResponseDto<T> {
    @ApiProperty({ example: true, type: 'except' })
    success: boolean;

    @ApiProperty({ required: true, description: '응답 데이터', type: 'except' })
    data: T;

    @ApiProperty({ required: false, example: '성공적으로 처리되었습니다.', description: '성공 메시지', type: 'except' })
    message?: string;
}

// 에러 응답 DTO
export class ErrorResponseDto {
    @ApiProperty({ example: false, type: 'except' })
    success: boolean;

    @ApiProperty({ example: 400, type: 'except' })
    statusCode: number;

    @ApiProperty({ example: '잘못된 요청입니다.', type: 'except' })
    message: string;
}
