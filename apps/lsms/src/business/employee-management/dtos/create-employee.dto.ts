import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateEmployeeDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    employeeNumber: string;

    @ApiProperty()
    @IsString()
    department: string;

    @ApiProperty()
    @IsString()
    position: string;
}
