import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsOptional } from 'class-validator';

/**
 * 프로젝트 할당 요청 DTO
 */
export class AssignProjectRequestDto {
    @ApiProperty({ description: '직원 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    employeeId: string;

    @ApiProperty({ description: '프로젝트 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    projectId: string;

    @ApiPropertyOptional({ description: '할당 시작일', example: '2024-01-01' })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({ description: '할당 종료일', example: '2024-12-31' })
    @IsDateString()
    @IsOptional()
    endDate?: string;
}

/**
 * 프로젝트 할당 응답 DTO
 */
export class AssignProjectResponseDto {
    @ApiProperty({ description: '할당된 프로젝트 ID' })
    id: string;

    @ApiProperty({ description: '직원 ID' })
    employeeId: string;

    @ApiProperty({ description: '프로젝트 ID' })
    projectId: string;

    @ApiPropertyOptional({ description: '할당 시작일' })
    startDate?: string | null;

    @ApiPropertyOptional({ description: '할당 종료일' })
    endDate?: string | null;

    @ApiProperty({ description: '활성화 여부' })
    isActive: boolean;
}
