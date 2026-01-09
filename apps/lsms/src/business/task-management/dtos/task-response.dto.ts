import { ApiProperty } from '@nestjs/swagger';

export class ManagerResponseDto {
    @ApiProperty({
        type: 'string',
    })
    employeeId: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    employeeNumber: string;

    @ApiProperty()
    department: string;

    @ApiProperty()
    position: string;

    @ApiProperty()
    rank: string;

    @ApiProperty()
    positionTitle: string;
}

export class TaskResponseDto {
    @ApiProperty({
        type: 'string',
        description: '태스크 타입',
    })
    type: string;

    @ApiProperty({
        type: 'string',
        description: '태스크 제목',
    })
    title: string;

    @ApiProperty({
        type: 'string',
        description: '일정 ID',
        nullable: true,
    })
    scheduleId: string | null;

    @ApiProperty({
        type: 'string',
        description: '예약 ID',
        nullable: true,
    })
    reservationId: string | null;

    @ApiProperty({
        type: 'string',
        description: '자원 ID',
        nullable: true,
    })
    resourceId: string | null;

    @ApiProperty({
        type: 'string',
        description: '자원 이름',
        nullable: true,
    })
    resourceName: string | null;

    @ApiProperty({
        type: 'string',
        description: '소모품 ID',
        nullable: true,
    })
    consumableId?: string | null;

    @ApiProperty({
        type: 'string',
        description: '소모품 이름',
        nullable: true,
        required: false,
    })
    consumableName?: string | null;

    @ApiProperty({
        type: 'string',
        description: '시작 날짜',
        nullable: true,
    })
    startDate: string | null;

    @ApiProperty({
        type: 'string',
        description: '종료 날짜',
        nullable: true,
    })
    endDate: string | null;

    @ApiProperty({
        type: ManagerResponseDto,
        description: '관리자',
        required: false,
    })
    manager?: ManagerResponseDto;
}

export class TaskListResponseDto {
    @ApiProperty({
        type: 'number',
        description: '총 작업 수',
    })
    totalCount: number;

    @ApiProperty({
        type: [TaskResponseDto],
        description: '작업 목록',
    })
    items: TaskResponseDto[];
}
