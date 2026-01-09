import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CheckPasswordDto {
    @ApiProperty({
        example: 'currentPassword123',
        description: '현재 비밀번호',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
