import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....',
    })
    accessToken: string;

    @ApiProperty({
        example: 'test@lumir.space',
    })
    email: string;

    @ApiProperty({
        example: '홍길동',
    })
    name: string;

    @ApiProperty({
        example: 'Web 파트',
    })
    department: string;

    @ApiProperty({
        example: '연구원',
    })
    position: string;

    @ApiProperty({
        example: '대표이사',
    })
    rank: string;

    @ApiProperty({
        example: '대표이사',
    })
    positionTitle: string;

    @ApiProperty({
        example: ['USER', 'RESOURCE_ADMIN', 'SYSTEM_ADMIN'],
    })
    roles: string[];
}
