import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsBoolean, IsNotEmpty } from 'class-validator';

/**
 * 관리자 직원 정보 응답 DTO
 */
export class EmployeeInfoResponseDto {
    @ApiProperty({ description: '직원 ID' })
    id: string;

    @ApiProperty({ description: '직원번호' })
    employeeNumber: string;

    @ApiProperty({ description: '직원명' })
    employeeName: string;
}

/**
 * 관리자 직원 목록 조회 응답 DTO
 */
export class GetManagerEmployeeListResponseDto {
    @ApiProperty({ description: '직원 목록', type: [EmployeeInfoResponseDto] })
    employees: EmployeeInfoResponseDto[];

    @ApiProperty({ description: '전체 직원 수' })
    totalCount: number;
}

/**
 * 직원-부서 권한 변경 요청 DTO
 */
export class UpdateEmployeeDepartmentPermissionRequestDto {
    @ApiProperty({ description: '직원 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    employeeId: string;

    @ApiProperty({ description: '부서 ID', example: '123e4567-e89b-12d3-a456-426614174001' })
    @IsUUID()
    @IsNotEmpty()
    departmentId: string;

    @ApiProperty({ description: '접근 권한', example: true })
    @IsBoolean()
    @IsNotEmpty()
    hasAccessPermission: boolean;

    @ApiProperty({ description: '검토 권한', example: false })
    @IsBoolean()
    @IsNotEmpty()
    hasReviewPermission: boolean;
}

/**
 * 직원-부서 권한 정보 응답 DTO
 */
export class EmployeeDepartmentPermissionResponseDto {
    @ApiProperty({ description: '권한 ID' })
    id: string;

    @ApiProperty({ description: '직원 ID' })
    employeeId: string;

    @ApiProperty({ description: '부서 ID' })
    departmentId: string;

    @ApiProperty({ description: '접근 권한' })
    hasAccessPermission: boolean;

    @ApiProperty({ description: '검토 권한' })
    hasReviewPermission: boolean;

    @ApiProperty({ description: '생성 일시' })
    createdAt: Date;

    @ApiProperty({ description: '수정 일시' })
    updatedAt: Date;

    @ApiPropertyOptional({ description: '삭제 일시' })
    deletedAt?: Date;

    @ApiPropertyOptional({ description: '생성자 ID' })
    createdBy?: string;

    @ApiPropertyOptional({ description: '수정자 ID' })
    updatedBy?: string;

    @ApiProperty({ description: '버전' })
    version: number;
}

/**
 * 직원-부서 권한 변경 응답 DTO
 */
export class UpdateEmployeeDepartmentPermissionResponseDto {
    @ApiProperty({ description: '권한 정보', type: EmployeeDepartmentPermissionResponseDto })
    permission: EmployeeDepartmentPermissionResponseDto;
}
