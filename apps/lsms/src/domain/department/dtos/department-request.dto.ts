import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsUUID } from 'class-validator';

export class DepartmentCreateRequestDto {
    @ApiProperty({ description: '부서명' })
    @IsString()
    departmentName: string;

    @ApiProperty({ description: '부서 코드' })
    @IsString()
    departmentCode: string;

    @ApiProperty({ description: '부서 유형' })
    @IsString()
    type: string;

    @ApiPropertyOptional({ description: '상위 부서 ID' })
    @IsOptional()
    @IsUUID()
    parentDepartmentId?: string;

    @ApiProperty({ description: '정렬 순서' })
    @IsNumber()
    order: number;
}

export class DepartmentUpdateRequestDto {
    @ApiPropertyOptional({ description: '부서명' })
    @IsOptional()
    @IsString()
    departmentName?: string;

    @ApiPropertyOptional({ description: '부서 코드' })
    @IsOptional()
    @IsString()
    departmentCode?: string;

    @ApiPropertyOptional({ description: '부서 유형' })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional({ description: '상위 부서 ID' })
    @IsOptional()
    @IsUUID()
    parentDepartmentId?: string;

    @ApiPropertyOptional({ description: '정렬 순서' })
    @IsOptional()
    @IsNumber()
    order?: number;
}
