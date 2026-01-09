import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({
        description: '?λ¬ ?€??,
        example: 'Bad Request',
    })
    error: string;

    @ApiProperty({
        description: '?λ¬ λ©”μ‹μ§€',
        example: 'ids ?λΌλ―Έν„°κ°€ ?„μ”?©λ‹??',
    })
    message: string;

    @ApiProperty({
        description: '?λ¬ ?μ„Έ ?•λ³΄',
        example: 'Invalid UUID format',
        required: false,
    })
    details?: string;
}
