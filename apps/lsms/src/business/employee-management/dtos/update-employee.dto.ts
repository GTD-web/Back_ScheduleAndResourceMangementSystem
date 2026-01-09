import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateEmployeeDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    employeeNumber?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    department?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    position?: string;
}
