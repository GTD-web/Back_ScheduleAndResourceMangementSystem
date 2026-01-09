import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        example: 'newPassword123',
        description: '새로운 비밀번호',
    })
    @IsString()
    @IsNotEmpty()
    newPassword: string;
}
