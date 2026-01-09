import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 엑셀 읽기 옵션 DTO
 */
export class ReadExcelOptionsDto {
    @ApiProperty({
        description: '워크시트 이름 (지정하지 않으면 첫 번째 시트)',
        required: false,
    })
    @IsString()
    @IsOptional()
    sheetName?: string;

    @ApiProperty({
        description: '워크시트 인덱스 (0부터 시작)',
        required: false,
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    sheetIndex?: number;

    @ApiProperty({
        description: '시작 행 번호 (1부터 시작)',
        required: false,
        default: 1,
    })
    @IsNumber()
    @IsOptional()
    @Min(1)
    startRow?: number;

    @ApiProperty({
        description: '종료 행 번호',
        required: false,
    })
    @IsNumber()
    @IsOptional()
    @Min(1)
    endRow?: number;

    @ApiProperty({
        description: '첫 행이 헤더인지 여부',
        required: false,
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    hasHeader?: boolean;

    @ApiProperty({
        description: '빈 셀 포함 여부',
        required: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    includeEmpty?: boolean;
}

/**
 * 워크시트 정보 DTO
 */
export class WorksheetInfoDto {
    @ApiProperty({ description: '워크시트 이름' })
    name: string;

    @ApiProperty({ description: '워크시트 인덱스' })
    index: number;

    @ApiProperty({ description: '총 행 수' })
    rowCount: number;

    @ApiProperty({ description: '총 열 수' })
    columnCount: number;

    @ApiProperty({ description: '상태 (visible/hidden 등)' })
    state: string;
}

/**
 * 엑셀 파일 정보 DTO
 */
export class ExcelFileInfoDto {
    @ApiProperty({ description: '워크시트 목록', type: [WorksheetInfoDto] })
    worksheets: WorksheetInfoDto[];

    @ApiProperty({ description: '총 워크시트 수' })
    worksheetCount: number;

    @ApiProperty({ description: '파일 형식' })
    format: string;
}

/**
 * 엑셀 데이터 결과 DTO
 */
export class ExcelDataResultDto {
    @ApiProperty({ description: '워크시트 이름' })
    sheetName: string;

    @ApiProperty({ description: '헤더 목록' })
    headers?: string[];

    @ApiProperty({ description: '데이터 (배열의 배열)' })
    data: any[][];

    @ApiProperty({ description: '데이터 (객체 배열, 헤더가 있는 경우)' })
    records?: Record<string, any>[];

    @ApiProperty({ description: '총 행 수' })
    rowCount: number;

    @ApiProperty({ description: '총 열 수' })
    columnCount: number;
}

/**
 * 셀 값 검증 규칙
 */
export class CellValidationRule {
    @ApiProperty({ description: '열 이름 또는 인덱스' })
    column: string | number;

    @ApiProperty({ description: '필수 여부' })
    required?: boolean;

    @ApiProperty({ description: '데이터 타입 (string, number, date 등)' })
    type?: 'string' | 'number' | 'date' | 'boolean';

    @ApiProperty({ description: '최소값 (숫자인 경우)' })
    min?: number;

    @ApiProperty({ description: '최대값 (숫자인 경우)' })
    max?: number;

    @ApiProperty({ description: '정규식 패턴' })
    pattern?: string;

    @ApiProperty({ description: '허용된 값 목록' })
    enum?: any[];
}

/**
 * 데이터 검증 결과
 */
export class ValidationResultDto {
    @ApiProperty({ description: '검증 성공 여부' })
    valid: boolean;

    @ApiProperty({ description: '에러 목록' })
    errors: Array<{
        row: number;
        column: string | number;
        value: any;
        message: string;
    }>;

    @ApiProperty({ description: '경고 목록' })
    warnings?: Array<{
        row: number;
        column: string | number;
        message: string;
    }>;
}

