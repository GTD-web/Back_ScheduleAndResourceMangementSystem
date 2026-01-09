import { ApiProperty } from '@nestjs/swagger';

export class ScheduleDepartmentResponseDto {
    @ApiProperty({
        description: '일정-부서 관계 ID',
        example: 'uuid-string',
    })
    scheduleDepartmentId: string;

    @ApiProperty({
        description: '일정 ID',
        example: 'uuid-string',
    })
    scheduleId: string;

    @ApiProperty({
        description: '부서 ID',
        example: 'uuid-string',
    })
    departmentId: string;

    @ApiProperty({
        description: '생성일시',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;
}

export class ScheduleDepartmentWithDetailsResponseDto {
    @ApiProperty({
        description: '일정-부서 관계 ID',
        example: 'uuid-string',
    })
    scheduleDepartmentId: string;

    @ApiProperty({
        description: '일정 ID',
        example: 'uuid-string',
    })
    scheduleId: string;

    @ApiProperty({
        description: '부서 ID',
        example: 'uuid-string',
    })
    departmentId: string;

    @ApiProperty({
        description: '부서명',
        example: '개발팀',
    })
    departmentName: string;

    @ApiProperty({
        description: '생성일시',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;
}
