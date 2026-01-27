import { ApiProperty } from '@nestjs/swagger';

/**
 * 파일 orgData 조회 응답 DTO
 */
export class GetFileOrgDataResponseDto {
    @ApiProperty({
        description: '파일 ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    fileId: string;

    @ApiProperty({
        description: '조직/부서 정보 데이터',
        nullable: true,
        example: {
            '개발팀': [
                { employeeNumber: '12345', name: '홍길동', position: '과장' },
            ],
        },
    })
    orgData: Record<string, any> | null;
}
