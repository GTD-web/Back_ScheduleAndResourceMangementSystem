import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { CalculationType } from '../../../domain/wage-calculation-type/wage-calculation-type.types';

/**
 * 임금 계산 유형 정보 응답 DTO
 */
export class WageCalculationTypeResponseDto {
    @ApiProperty({ description: '임금 계산 유형 ID' })
    id: string;

    @ApiProperty({ description: '임금 계산 유형', enum: CalculationType, example: CalculationType.REGULAR_WAGE })
    calculationType: CalculationType;

    @ApiProperty({ description: '시작일 (yyyy-MM-dd 형식)', example: '2024-01-01' })
    startDate: string;

    @ApiProperty({ description: '변경일시' })
    changedAt: Date;

    @ApiProperty({ description: '현재 적용 중 여부' })
    isCurrentlyApplied: boolean;

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
 * 임금 계산 유형 생성 요청 DTO
 */
export class CreateWageCalculationTypeRequestDto {
    @ApiProperty({
        description: '임금 계산 유형',
        enum: CalculationType,
        example: CalculationType.REGULAR_WAGE,
    })
    @IsEnum(CalculationType)
    @IsNotEmpty()
    calculationType: CalculationType;

    @ApiProperty({ description: '시작일 (yyyy-MM-dd 형식)', example: '2024-01-01' })
    @IsString()
    @IsNotEmpty()
    startDate: string;

    @ApiPropertyOptional({ description: '변경일시', example: '2024-01-01T00:00:00Z' })
    @IsDateString()
    @IsOptional()
    changedAt?: Date;

    @ApiPropertyOptional({ description: '현재 적용 중 여부', default: true })
    @IsBoolean()
    @IsOptional()
    isCurrentlyApplied?: boolean;
}

/**
 * 임금 계산 유형 생성 응답 DTO
 */
export class CreateWageCalculationTypeResponseDto {
    @ApiProperty({ description: '임금 계산 유형 정보', type: WageCalculationTypeResponseDto })
    wageCalculationType: WageCalculationTypeResponseDto;
}

/**
 * 임금 계산 유형 목록 조회 응답 DTO
 */
export class GetWageCalculationTypeListResponseDto {
    @ApiProperty({ description: '임금 계산 유형 목록', type: [WageCalculationTypeResponseDto] })
    wageCalculationTypes: WageCalculationTypeResponseDto[];

    @ApiProperty({ description: '전체 개수' })
    totalCount: number;
}
