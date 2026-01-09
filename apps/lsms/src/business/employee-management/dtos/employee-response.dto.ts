import { ApiProperty } from '@nestjs/swagger';

export class EmployeeResponseDto {
    @ApiProperty()
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
