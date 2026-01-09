import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ScheduleDepartmentCreateRequestDto {
    @ApiProperty({
        description: '일정 ID',
        example: 'uuid-string',
    })
    @IsNotEmpty()
    @IsUUID()
    scheduleId: string;

    @ApiProperty({
        description: '부서 ID',
        example: 'uuid-string',
    })
    @IsNotEmpty()
    @IsUUID()
    departmentId: string;
}

export class ScheduleDepartmentUpdateRequestDto {
    @ApiProperty({
        description: '부서 ID',
        example: 'uuid-string',
    })
    @IsNotEmpty()
    @IsUUID()
    departmentId: string;
}
