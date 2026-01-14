import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsUUID, IsOptional } from 'class-validator';

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
 * 부서 정보 응답 DTO
 */
export class DepartmentInfoForPermissionResponseDto {
    @ApiProperty({ description: '부서 ID' })
    id: string;

    @ApiProperty({ description: '부서 코드' })
    departmentCode: string;

    @ApiProperty({ description: '부서명' })
    departmentName: string;

    @ApiProperty({ description: '부서 타입' })
    type: string;

    @ApiProperty({ description: '정렬 순서' })
    order: number;
}

/**
 * 권한 관리용 부서 목록 조회 응답 DTO
 */
export class GetDepartmentListForPermissionResponseDto {
    @ApiProperty({ description: '부서 목록', type: [DepartmentInfoForPermissionResponseDto] })
    departments: DepartmentInfoForPermissionResponseDto[];

    @ApiProperty({ description: '전체 부서 수' })
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

/**
 * 직원 추가 정보 변경 요청 DTO
 */
export class UpdateEmployeeExtraInfoRequestDto {
    @ApiProperty({ description: '직원 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    employeeId: string;

    @ApiProperty({ description: '대시보드 요약에서 제외 여부', example: false })
    @IsBoolean()
    @IsNotEmpty()
    isExcludedFromSummary: boolean;
}

/**
 * 직원 추가 정보 응답 DTO
 */
export class EmployeeExtraInfoResponseDto {
    @ApiProperty({ description: '추가 정보 ID' })
    id: string;

    @ApiProperty({ description: '직원 ID' })
    employeeId: string;

    @ApiProperty({ description: '대시보드 요약에서 제외 여부' })
    isExcludedFromSummary: boolean;

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
 * 직원 추가 정보 변경 응답 DTO
 */
export class UpdateEmployeeExtraInfoResponseDto {
    @ApiProperty({ description: '추가 정보', type: EmployeeExtraInfoResponseDto })
    extraInfo: EmployeeExtraInfoResponseDto;
}

/**
 * 휴일 정보 생성 요청 DTO
 */
export class CreateHolidayInfoRequestDto {
    @ApiProperty({ description: '휴일명', example: '신정' })
    @IsString()
    @IsNotEmpty()
    holidayName: string;

    @ApiProperty({ description: '휴일 날짜', example: '2024-01-01' })
    @IsString()
    @IsNotEmpty()
    holidayDate: string;
}

/**
 * 휴일 정보 응답 DTO
 */
export class HolidayInfoResponseDto {
    @ApiProperty({ description: '휴일 ID' })
    id: string;

    @ApiProperty({ description: '휴일명' })
    holidayName: string;

    @ApiProperty({ description: '휴일 날짜' })
    holidayDate: string;

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
 * 휴일 정보 생성 응답 DTO
 */
export class CreateHolidayInfoResponseDto {
    @ApiProperty({ description: '휴일 정보', type: HolidayInfoResponseDto })
    holidayInfo: HolidayInfoResponseDto;
}

/**
 * 휴일 정보 수정 요청 DTO
 */
export class UpdateHolidayInfoRequestDto {
    @ApiProperty({ description: '휴일 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @ApiPropertyOptional({ description: '휴일명', example: '신정' })
    @IsString()
    @IsOptional()
    holidayName?: string;

    @ApiPropertyOptional({ description: '휴일 날짜', example: '2024-01-01' })
    @IsString()
    @IsOptional()
    holidayDate?: string;
}

/**
 * 휴일 정보 수정 응답 DTO
 */
export class UpdateHolidayInfoResponseDto {
    @ApiProperty({ description: '휴일 정보', type: HolidayInfoResponseDto })
    holidayInfo: HolidayInfoResponseDto;
}

/**
 * 휴일 정보 삭제 요청 DTO
 */
export class DeleteHolidayInfoRequestDto {
    @ApiProperty({ description: '휴일 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    id: string;
}

/**
 * 휴일 정보 삭제 응답 DTO
 */
export class DeleteHolidayInfoResponseDto {
    @ApiProperty({ description: '삭제 성공 여부' })
    success: boolean;
}

/**
 * 특별근태시간 생성 요청 DTO
 */
export class CreateWorkTimeOverrideRequestDto {
    @ApiProperty({ description: '적용 날짜', example: '2024-01-01' })
    @IsString()
    @IsNotEmpty()
    date: string;

    @ApiPropertyOptional({ description: '시작 시간', example: '09:00:00' })
    @IsString()
    @IsOptional()
    startWorkTime?: string;

    @ApiPropertyOptional({ description: '종료 시간', example: '18:00:00' })
    @IsString()
    @IsOptional()
    endWorkTime?: string;

    @ApiPropertyOptional({ description: '변경 사유', example: '눈으로 인한 출근시간 조정' })
    @IsString()
    @IsOptional()
    reason?: string;
}

/**
 * 특별근태시간 응답 DTO
 */
export class WorkTimeOverrideResponseDto {
    @ApiProperty({ description: '특별근태시간 ID' })
    id: string;

    @ApiProperty({ description: '적용 날짜' })
    date: string;

    @ApiPropertyOptional({ description: '시작 시간' })
    startWorkTime?: string | null;

    @ApiPropertyOptional({ description: '종료 시간' })
    endWorkTime?: string | null;

    @ApiPropertyOptional({ description: '변경 사유' })
    reason?: string | null;

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
 * 특별근태시간 생성 응답 DTO
 */
export class CreateWorkTimeOverrideResponseDto {
    @ApiProperty({ description: '특별근태시간 정보', type: WorkTimeOverrideResponseDto })
    workTimeOverride: WorkTimeOverrideResponseDto;
}

/**
 * 특별근태시간 수정 요청 DTO
 */
export class UpdateWorkTimeOverrideRequestDto {
    @ApiProperty({ description: '특별근태시간 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @ApiPropertyOptional({ description: '시작 시간', example: '09:00:00' })
    @IsString()
    @IsOptional()
    startWorkTime?: string;

    @ApiPropertyOptional({ description: '종료 시간', example: '18:00:00' })
    @IsString()
    @IsOptional()
    endWorkTime?: string;

    @ApiPropertyOptional({ description: '변경 사유', example: '눈으로 인한 출근시간 조정' })
    @IsString()
    @IsOptional()
    reason?: string;
}

/**
 * 특별근태시간 수정 응답 DTO
 */
export class UpdateWorkTimeOverrideResponseDto {
    @ApiProperty({ description: '특별근태시간 정보', type: WorkTimeOverrideResponseDto })
    workTimeOverride: WorkTimeOverrideResponseDto;
}

/**
 * 특별근태시간 삭제 요청 DTO
 */
export class DeleteWorkTimeOverrideRequestDto {
    @ApiProperty({ description: '특별근태시간 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    id: string;
}

/**
 * 특별근태시간 삭제 응답 DTO
 */
export class DeleteWorkTimeOverrideResponseDto {
    @ApiProperty({ description: '삭제 성공 여부' })
    success: boolean;
}

/**
 * 휴일 목록 조회 응답 DTO
 */
export class GetHolidayListResponseDto {
    @ApiProperty({ description: '휴일 목록', type: [HolidayInfoResponseDto] })
    holidays: HolidayInfoResponseDto[];

    @ApiProperty({ description: '전체 휴일 수' })
    totalCount: number;
}

/**
 * 특별근태시간 목록 조회 응답 DTO
 */
export class GetWorkTimeOverrideListResponseDto {
    @ApiProperty({ description: '특별근태시간 목록', type: [WorkTimeOverrideResponseDto] })
    workTimeOverrides: WorkTimeOverrideResponseDto[];

    @ApiProperty({ description: '전체 특별근태시간 수' })
    totalCount: number;
}
