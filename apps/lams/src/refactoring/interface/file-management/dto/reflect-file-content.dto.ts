import { IsString, IsNotEmpty, IsArray, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 파일 내용 반영 요청 DTO
 */
export class ReflectFileContentRequestDto {
    @ApiProperty({
        description: '파일 ID 목록 (순서대로 반영됨)',
        example: ['86a1e801-d278-422e-90f8-bea04e40b87a', '510f7c1c-a227-4088-884d-9f0df7962a73'],
        type: [String],
    })
    @IsArray()
    @IsNotEmpty()
    @IsUUID('4', { each: true })
    fileIds: string[];

    @ApiProperty({
        description: '적용할 직원 ID 목록',
        example: ['839e6f06-8d44-43a1-948c-095253c4cf8c'],
        type: [String],
    })
    @IsArray()
    @IsNotEmpty()
    @IsUUID('4', { each: true })
    employeeIds: string[];

    @ApiProperty({
        description: '연도',
        example: '2025',
    })
    @IsString()
    @IsNotEmpty()
    year: string;

    @ApiProperty({
        description: '월',
        example: '11',
    })
    @IsString()
    @IsNotEmpty()
    month: string;
}

/**
 * 파일 반영 결과
 */
export class FileReflectionResult {
    @ApiProperty({ description: '파일 ID' })
    fileId: string;

    @ApiProperty({ description: '반영 이력 ID' })
    reflectionHistoryId: string;
}

/**
 * 파일 내용 반영 응답 DTO
 */
export class ReflectFileContentResponseDto {
    @ApiProperty({
        description: '반영된 파일 목록',
        type: [FileReflectionResult],
    })
    reflections: FileReflectionResult[];
}
