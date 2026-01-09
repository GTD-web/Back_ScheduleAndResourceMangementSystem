import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class ChangeRoleDto {
    @ApiProperty({
        example: 'employeeId',
        description: '직원 아이디',
    })
    @IsString()
    @IsNotEmpty()
    employeeId: string;

    @ApiProperty({
        example: true,
        description: '자원 담당자 여부',
    })
    @IsBoolean()
    @IsNotEmpty()
    isResourceAdmin: boolean;
}
