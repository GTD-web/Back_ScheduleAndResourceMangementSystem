import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * 근태유형 정보 응답 DTO
 */
export class AttendanceTypeResponseDto {
    @ApiProperty({ description: '근태유형 ID' })
    id: string;

    @ApiProperty({ description: '근태유형 제목' })
    title: string;

    @ApiProperty({ description: '근무 시간 (분 단위)' })
    workTime: number;

    @ApiProperty({ description: '인정 근무 시간 여부' })
    isRecognizedWorkTime: boolean;

    @ApiPropertyOptional({ description: '시작 근무 시간' })
    startWorkTime?: string | null;

    @ApiPropertyOptional({ description: '종료 근무 시간' })
    endWorkTime?: string | null;

    @ApiProperty({ description: '차감 연차' })
    deductedAnnualLeave: number;

    @ApiPropertyOptional({ description: '출석 타입 코드' })
    code?: string | null;

    @ApiProperty({ description: '활성화 여부' })
    isActive: boolean;

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
 * 근태유형 목록 조회 응답 DTO
 */
export class GetAttendanceTypeListResponseDto {
    @ApiProperty({ description: '근태유형 목록', type: [AttendanceTypeResponseDto] })
    attendanceTypes: AttendanceTypeResponseDto[];

    @ApiProperty({ description: '전체 근태유형 수' })
    totalCount: number;
}

/**
 * 근태유형 생성 요청 DTO
 */
export class CreateAttendanceTypeRequestDto {
    @ApiProperty({ description: '근태유형 제목', example: '연차' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: '근무 시간 (분 단위)', example: 480 })
    @IsOptional()
    workTime: number;

    @ApiProperty({ description: '인정 근무 시간 여부', example: true })
    @IsOptional()
    isRecognizedWorkTime: boolean;

    @ApiPropertyOptional({ description: '시작 근무 시간', example: '09:00' })
    @IsString()
    @IsOptional()
    startWorkTime?: string;

    @ApiPropertyOptional({ description: '종료 근무 시간', example: '18:00' })
    @IsString()
    @IsOptional()
    endWorkTime?: string;

    @ApiPropertyOptional({ description: '차감 연차', example: 1.0 })
    @IsOptional()
    deductedAnnualLeave?: number;

    @ApiPropertyOptional({ description: '출석 타입 코드', example: 'ANNUAL_LEAVE' })
    @IsString()
    @IsOptional()
    code?: string;

    @ApiPropertyOptional({ description: '활성화 여부', example: true })
    @IsOptional()
    isActive?: boolean;
}

/**
 * 근태유형 생성 응답 DTO
 */
export class CreateAttendanceTypeResponseDto {
    @ApiProperty({ description: '근태유형 정보', type: AttendanceTypeResponseDto })
    attendanceType: AttendanceTypeResponseDto;
}

/**
 * 근태유형 수정 요청 DTO
 */
export class UpdateAttendanceTypeRequestDto {
    @ApiPropertyOptional({ description: '근태유형 제목', example: '연차' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ description: '근무 시간 (분 단위)', example: 480 })
    @IsOptional()
    workTime?: number;

    @ApiPropertyOptional({ description: '인정 근무 시간 여부', example: true })
    @IsOptional()
    isRecognizedWorkTime?: boolean;

    @ApiPropertyOptional({ description: '시작 근무 시간', example: '09:00' })
    @IsString()
    @IsOptional()
    startWorkTime?: string;

    @ApiPropertyOptional({ description: '종료 근무 시간', example: '18:00' })
    @IsString()
    @IsOptional()
    endWorkTime?: string;

    @ApiPropertyOptional({ description: '차감 연차', example: 1.0 })
    @IsOptional()
    deductedAnnualLeave?: number;

    @ApiPropertyOptional({ description: '출석 타입 코드', example: 'ANNUAL_LEAVE' })
    @IsString()
    @IsOptional()
    code?: string;

    @ApiPropertyOptional({ description: '활성화 여부', example: true })
    @IsOptional()
    isActive?: boolean;
}

/**
 * 근태유형 수정 응답 DTO
 */
export class UpdateAttendanceTypeResponseDto {
    @ApiProperty({ description: '근태유형 정보', type: AttendanceTypeResponseDto })
    attendanceType: AttendanceTypeResponseDto;
}

/**
 * 근태유형 삭제 응답 DTO
 */
export class DeleteAttendanceTypeResponseDto {
    @ApiProperty({ description: '삭제 성공 여부' })
    success: boolean;
}
