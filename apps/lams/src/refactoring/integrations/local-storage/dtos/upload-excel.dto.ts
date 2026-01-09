import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 엑셀 파일 업로드 DTO
 */
export class UploadExcelDto {
    @ApiProperty({
        description: '파일 이름',
        example: 'employees-report.xlsx',
    })
    @IsString()
    @IsNotEmpty()
    fileName: string;

    @ApiProperty({
        description: '저장 폴더 경로 (선택사항)',
        example: 'reports/2024',
        required: false,
    })
    @IsString()
    @IsOptional()
    folder?: string;

    @ApiProperty({
        description: '파일 설명 또는 메타데이터 (선택사항)',
        required: false,
    })
    @IsOptional()
    metadata?: Record<string, string>;
}

/**
 * 파일 업로드 응답 DTO
 */
export class UploadExcelResponseDto {
    @ApiProperty({ description: '업로드 성공 여부' })
    success: boolean;

    @ApiProperty({ description: '메시지' })
    message: string;

    @ApiProperty({ description: '파일 키 (경로)' })
    fileKey: string;

    @ApiProperty({ description: '버킷 이름 (로컬 저장소에서는 폴더 경로)' })
    bucket: string;

    @ApiProperty({ description: '파일 URL' })
    url?: string;

    @ApiProperty({ description: '업로드 일시' })
    uploadedAt: Date;
}

/**
 * 파일 다운로드 요청 DTO
 */
export class GetFileDto {
    @ApiProperty({
        description: '파일 키 (경로)',
        example: 'excel-files/employees-report.xlsx',
    })
    @IsString()
    @IsNotEmpty()
    fileKey: string;

    @ApiProperty({
        description: 'URL 만료 시간 (초)',
        example: 3600,
        required: false,
    })
    @IsOptional()
    expiresIn?: number;
}

/**
 * 파일 다운로드 응답 DTO
 */
export class GetFileResponseDto {
    @ApiProperty({ description: '파일 다운로드 URL' })
    url: string;

    @ApiProperty({ description: 'URL 만료 시간 (초)' })
    expiresIn: number;

    @ApiProperty({ description: '만료 일시' })
    expiresAt: Date;
}

/**
 * 파일 삭제 요청 DTO
 */
export class DeleteFileDto {
    @ApiProperty({
        description: '파일 키 (경로)',
        example: 'excel-files/employees-report.xlsx',
    })
    @IsString()
    @IsNotEmpty()
    fileKey: string;
}

/**
 * 파일 삭제 응답 DTO
 */
export class DeleteFileResponseDto {
    @ApiProperty({ description: '삭제 성공 여부' })
    success: boolean;

    @ApiProperty({ description: '메시지' })
    message: string;

    @ApiProperty({ description: '삭제된 파일 키' })
    fileKey: string;
}

/**
 * 파일 목록 조회 요청 DTO
 */
export class ListFilesDto {
    @ApiProperty({
        description: '조회할 폴더 경로 (선택사항)',
        example: 'excel-files/reports',
        required: false,
    })
    @IsString()
    @IsOptional()
    prefix?: string;

    @ApiProperty({
        description: '최대 조회 개수',
        example: 100,
        required: false,
        default: 100,
    })
    @IsOptional()
    maxKeys?: number;
}

/**
 * 파일 정보 DTO
 */
export class FileInfoDto {
    @ApiProperty({ description: '파일 키 (경로)' })
    key: string;

    @ApiProperty({ description: '파일 크기 (바이트)' })
    size: number;

    @ApiProperty({ description: '최종 수정 일시' })
    lastModified: Date;

    @ApiProperty({ description: 'ETag' })
    etag: string;
}

/**
 * 파일 목록 조회 응답 DTO
 */
export class ListFilesResponseDto {
    @ApiProperty({ description: '파일 목록', type: [FileInfoDto] })
    files: FileInfoDto[];

    @ApiProperty({ description: '전체 파일 개수' })
    count: number;

    @ApiProperty({ description: '조회된 폴더 경로' })
    prefix?: string;
}
