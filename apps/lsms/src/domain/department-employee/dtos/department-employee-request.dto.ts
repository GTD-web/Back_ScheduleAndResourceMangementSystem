import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class DepartmentEmployeeCreateRequestDto {
    @ApiProperty({ description: '부서 ID' })
    @IsUUID()
    departmentId: string;

    @ApiProperty({ description: '직원 ID' })
    @IsUUID()
    employeeId: string;

    @ApiProperty({ description: '부서장 여부' })
    @IsBoolean()
    isManager: boolean;

    @ApiProperty({ description: '소속 시작일' })
    @IsDateString()
    startDate: string;

    @ApiPropertyOptional({ description: '소속 종료일' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({ description: '활성 상태' })
    @IsBoolean()
    isActive: boolean;
}

export class DepartmentEmployeeUpdateRequestDto {
    @ApiPropertyOptional({ description: '부서장 여부' })
    @IsOptional()
    @IsBoolean()
    isManager?: boolean;

    @ApiPropertyOptional({ description: '소속 시작일' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: '소속 종료일' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ description: '활성 상태' })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
