import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SsoResponseDto {
    @ApiProperty({ description: '토큰 타입', example: 'Bearer' })
    tokenType: string;

    @ApiProperty({ description: '액세스 토큰', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiO...' })
    accessToken: string;

    @ApiProperty({ description: '토큰 만료 시간', example: '2025-03-26T00:00:00.000Z' })
    expiresAt: Date;

    @ApiProperty({ description: '리프레시 토큰', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiO...' })
    refreshToken: string;

    @ApiProperty({ description: '리프레시 토큰 만료 시간', example: '2025-03-26T00:00:00.000Z' })
    refreshTokenExpiresAt: Date;

    @ApiProperty({ description: '사용자 이름', example: '구석현' })
    name: string;

    @ApiProperty({ description: '사용자 이메일', example: 'koo.sukhyun@lumir.space' })
    email: string;

    @ApiProperty({ description: '사용자 비밀번호', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    password: string;

    @ApiProperty({ description: '사용자 사번', example: '24020' })
    employeeNumber: string;

    @ApiProperty({ description: '사용자 전화번호', example: '010-1234-5678' })
    phoneNumber: string;

    @ApiProperty({ description: '사용자 생년월일', example: '1980-07-04T00:00:00.000Z' })
    dateOfBirth: Date;

    @ApiProperty({ description: '사용자 성별', example: 'MALE' })
    gender: string;

    @ApiProperty({ description: '사용자 입사일', example: '2024-05-21T00:00:00.000Z' })
    hireDate: Date;

    @ApiProperty({ description: '사용자 재직 상태', example: '재직중' })
    status: string;

    @ApiProperty({ description: '사용자 부서', example: '대표이사' })
    department: string;

    @ApiProperty({ description: '사용자 직위', example: '대표이사' })
    position: string;

    @ApiProperty({ description: '사용자 직급', example: '대표이사' })
    rank: string;
}
